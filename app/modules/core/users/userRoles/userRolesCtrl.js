'use strict';
angular.module('Squared')
  .controller('UserRolesCtrl', UserRolesCtrl);

/* @ngInject */
function UserRolesCtrl($scope, $translate, $stateParams, $state, SessionStorage, Userservice, Log, Authinfo, Config, $rootScope, Notification, Orgservice, SyncService) {
  $scope.currentUser = $stateParams.currentUser;
  if ($scope.currentUser) {
    $scope.roles = $scope.currentUser.roles;
  }

  $scope.dirsyncEnabled = false;
  $scope.isMsgrSyncEnabled = false;

  $scope.getMessengerSyncStatus = getMessengerSyncStatus;
  $scope.rolesObj = {};

  var inArray = function (array, el) {
    for (var i = array.length; i--;) {
      if (array[i] === el) {
        return true;
      }
    }
    return false;
  };

  var isEqualArrays = function (arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (var i = arr1.length; i--;) {
      if (!inArray(arr2, arr1[i])) {
        return false;
      }
    }
    return true;
  };

  var checkMainRoles = function (roles) {
    if ($scope.roles) {
      if (isEqualArrays(roles, _.intersection($scope.roles, roles))) {
        return 1;
      } else {
        return 2;
      }
    } else {
      return 0;
    }
  };

  var checkSubRoles = function (subRole, subRole2) {
    if ($scope.roles) {
      if ($scope.roles.indexOf(subRole) > -1 && $scope.roles.indexOf(subRole2) === -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return null;
    }
  };

  function getMessengerSyncStatus() {
    SyncService.isMessengerSyncEnabled()
      .then(function (isIt) {
        $scope.isMsgrSyncEnabled = isIt;
      }, function (errorMsg) {
        Log.error(errorMsg);
      });
  }
  if (null !== Authinfo.getOrgId()) {
    getMessengerSyncStatus();
  }

  $scope.rolesObj.adminRadioValue = checkMainRoles([Config.backend_roles.full_admin]);
  //$scope.userAdminValue = checkSubRoles(Config.backend_roles.full_admin, Config.backend_roles.all);
  $scope.rolesObj.salesAdminValue = checkSubRoles(Config.backend_roles.sales);
  $scope.rolesObj.billingAdminValue = checkSubRoles(Config.backend_roles.billing);
  $scope.rolesObj.supportAdminValue = checkSubRoles(Config.backend_roles.support);
  $scope.rolesObj.cloudAdminValue = checkSubRoles(Config.backend_roles.application);

  $scope.noAdmin = {
    label: $translate.instant('rolesPanel.noAdmin'),
    value: 0,
    name: 'adminRoles',
    id: 'noAdmin'
  };

  $scope.fullAdmin = {
    label: $translate.instant('rolesPanel.fullAdmin'),
    value: 1,
    name: 'adminRoles',
    id: 'fullAdmin'
  };

  $scope.partialAdmin = {
    label: $translate.instant('rolesPanel.partialAdmin'),
    value: 2,
    name: 'adminRoles',
    id: 'partialAdmin'
  };

  $scope.sipAddr = "";
  if ($scope.currentUser.sipAddresses) {
    for (var x = 0; x < $scope.currentUser.sipAddresses.length; x++) {
      if ($scope.currentUser.sipAddresses[x].type == "cloud-calling") {
        $scope.sipAddr = $scope.currentUser.sipAddresses[x].value;
      }
    }
  }

  var checkPartialRoles = function (roleEnabled) {
    if (roleEnabled) {
      return Config.roleState.active;
    } else {
      return Config.roleState.inactive;
    }
  };

  $scope.isPartner = function () {
    return SessionStorage.get('partnerOrgId');
  };

  function resetForm() {
    $scope.rolesEdit.form.$setPristine();
    $scope.rolesEdit.form.$setUntouched();
  }

  $scope.resetRoles = function () {
    $state.go('user-overview.userProfile');
    $scope.rolesObj.adminRadioValue = checkMainRoles([Config.backend_roles.full_admin]);
    if ($scope.rolesObj.adminRadioValue !== 2) {
      $scope.clearCheckboxes();
    }
    resetForm();
  };

  Orgservice.getOrg(function (data, status) {
    if (data.success) {
      $scope.dirsyncEnabled = data.dirsyncEnabled;
    } else {
      Log.debug('Get existing org failed. Status: ' + status);
    }
  });

  $scope.updateRoles = function () {

    var choice = $scope.rolesObj.adminRadioValue;
    var roles = [];

    if ($scope.rolesObj.adminRadioValue === 0) {
      for (var roleNames in Config.roles) {
        var inactiveRoleState = {
          'roleName': Config.roles[roleNames],
          'roleState': Config.roleState.inactive
        };
        roles.push(inactiveRoleState);
      }

    } else {
      if ($scope.rolesObj.adminRadioValue === 1) {
        roles.push({
          'roleName': Config.roles.full_admin,
          'roleState': Config.roleState.active
        });

        roles.push({
          'roleName': Config.roles.all,
          'roleState': Config.roleState.inactive
        });
      } else {
        roles.push({
          'roleName': Config.roles.full_admin,
          'roleState': checkPartialRoles($scope.userAdminValue)
        });

        roles.push({
          'roleName': Config.roles.all,
          'roleState': Config.roleState.inactive
        });
      }

      roles.push({
        'roleName': Config.roles.sales,
        'roleState': checkPartialRoles($scope.rolesObj.salesAdminValue)
      });

      roles.push({
        'roleName': Config.roles.billing,
        'roleState': checkPartialRoles($scope.rolesObj.billingAdminValue)
      });

      roles.push({
        'roleName': Config.roles.support,
        'roleState': checkPartialRoles($scope.rolesObj.supportAdminValue)
      });

      roles.push({
        'roleName': Config.roles.reports,
        'roleState': checkPartialRoles($scope.rolesObj.supportAdminValue)
      });

      roles.push({
        'roleName': Config.roles.application,
        'roleState': checkPartialRoles($scope.rolesObj.cloudAdminValue)
      });
    }

    Userservice.patchUserRoles($scope.currentUser.userName, $scope.currentUser.displayName, roles, function (data, status) {
      if (data.success) {
        var userData = {
          'schemas': Config.scimSchemas,
          'name': {},
          'meta': {
            'attributes': []
          }
        };
        // Add or delete properties depending on whether or not their value is empty/blank.
        // With property value set to "", the back-end will respond with a 400 error.
        // Guidance from CI team is to not specify any property containing an empty string
        // value. Instead, add the property to meta.attribute to have its value be deleted.
        if ($scope.currentUser.name) {
          if ($scope.currentUser.name.givenName) {
            userData.name["givenName"] = $scope.currentUser.name.givenName;
          } else {
            userData.meta.attributes.push('name.givenName');
          }
          if ($scope.currentUser.name.familyName) {
            userData.name["familyName"] = $scope.currentUser.name.familyName;
          } else {
            userData.meta.attributes.push('name.familyName');
          }
        }
        if ($scope.currentUser.displayName) {
          userData.displayName = $scope.currentUser.displayName;
        } else {
          userData.meta.attributes.push('displayName');
        }

        Log.debug('Updating user: ' + $scope.currentUser.id + ' with data: ');

        if (!$scope.dirsyncEnabled) {
          Userservice.updateUserProfile($scope.currentUser.id, userData, function (data, status) {
            if (data.success) {
              var successMessage = [];
              successMessage.push($translate.instant('profilePage.success'));
              Notification.notify(successMessage, 'success');
              $scope.user = data;
              $rootScope.$broadcast('USER_LIST_UPDATED');
              resetForm();
            } else {
              Log.debug('Update existing user failed. Status: ' + status);
              var errorMessage = [];
              errorMessage.push($translate.instant('profilePage.error'));
              Notification.notify(errorMessage, 'error');
            }
          });
        } else {
          var successMessage = [];
          successMessage.push($translate.instant('profilePage.success'));
          Notification.notify(successMessage, 'success');
          $scope.user = data;
          $rootScope.$broadcast('USER_LIST_UPDATED');
          resetForm();
        }
      } else {
        Log.debug('Updating user\'s roles failed. Status: ' + status);
        var errorMessage = [];
        errorMessage.push($translate.instant('profilePage.rolesError'));
        Notification.notify(errorMessage, 'error');
      }

    });

    $scope.rolesObj.adminRadioValue = choice;

  };

  $scope.clearCheckboxes = function () {
    $scope.rolesObj.userAdminValue = false;
    $scope.rolesObj.billingAdminValue = false;
    $scope.rolesObj.supportAdminValue = false;
    $scope.rolesObj.salesAdminValue = false;
    $scope.isChecked = false;
  };

  $scope.supportCheckboxes = function () {
    $scope.rolesObj.supportAdminValue = true;
    $scope.rolesObj.adminRadioValue = 2;
    $scope.rolesEdit.form.$dirty = true;
  };

  $scope.partialCheckboxes = function () {
    $scope.rolesObj.adminRadioValue = 2;
    $scope.rolesEdit.form.$dirty = true;
  };

}
