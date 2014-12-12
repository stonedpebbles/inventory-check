'use strict';

angular.module('Squared')
  .controller('UserEntitlementsCtrl', ['$scope', '$timeout', '$location', '$window', 'Userservice', 'UserListService', 'Log', 'Config', 'Pagination', '$rootScope', 'Notification', '$filter', 'Utils', 'Authinfo',
    function ($scope, $timeout, $location, $window, Userservice, UserListService, Log, Config, Pagination, $rootScope, Notification, $filter, Utils, Authinfo) {

      $scope.entitlementsKeys = Object.keys($scope.entitlements).sort().reverse();
      $scope.saveDisabled = true;

      function Feature(name, state) {
        this.entitlementName = name;
        this.entitlementState = state ? 'ACTIVE' : 'INACTIVE';
      }

      function getFeature(service, state) {
        return new Feature(service, state);
      }

      $scope.isServiceAllowed = function (service) {
        return Authinfo.isServiceAllowed(service);
      };

      $scope.getServiceName = function (service) {
        for (var i = 0; i < $rootScope.services.length; i++) {
          var svc = $rootScope.services[i];
          if (svc.sqService === service) {
            return svc.displayName;
          }
        }
      };

      $scope.shouldAddIndent = function (key, reference) {
        return key !== reference;
      };

      var getUserEntitlementList = function (entitlements) {
        var entList = [];
        for (var i = 0; i < $rootScope.services.length; i++) {
          var service = $rootScope.services[i].sqService;
          entList.push(getFeature(service, entitlements[service]));
        }
        return entList;
      };

      var watchCheckboxes = function () {
        $timeout(function () {});
        var flag = false;
        $scope.$watchCollection('entitlements', function (newEntitlements, oldEntitlements) {
          if (flag) {
            flag = false;
            return;
          }
          var changedKey = Utils.changedKey(newEntitlements, oldEntitlements);
          if (changedKey === 'webExSquared' && !newEntitlements.webExSquared && Utils.areEntitlementsActive($scope.entitlements)) {
            for (var key in $scope.entitlements) {
              if (key !== 'webExSquared') {
                $scope.entitlements[key] = false;
                flag = true;
              }
            }
            $scope.saveDisabled = false;
          } else if (!$scope.entitlements.webExSquared && !oldEntitlements[changedKey] && changedKey !== 'webExSquared') {
            $scope.entitlements.webExSquared = true;
            $scope.saveDisabled = false;
          } else if (newEntitlements !== oldEntitlements) {
            $scope.saveDisabled = false;
          }
        });

        $scope.$watch('currentUser', function (newUser, oldUser) {
          if (newUser.id !== oldUser.id) {
            $timeout(function () {
              $scope.saveDisabled = true;
            }, 10);
          }
        });
      };

      $scope.changeEntitlement = function (user) {
        Log.debug('Entitling user.', user);
        angular.element('#btn-save').button('loading');
        Userservice.updateUsers([{
          'address': user.userName
        }], getUserEntitlementList($scope.entitlements), function (data) {
          var entitleResult = {
            msg: null,
            type: 'null'
          };
          if (data.success) {
            var userStatus = data.userResponse[0].status;
            if (userStatus === 200) {
              entitleResult.msg = data.userResponse[0].email + '\'s entitlements were updated successfully.';
              entitleResult.type = 'success';
              if ($scope.entitlements.webExSquared === true) {
                angular.element('.icon-' + user.id).html($filter('translate')('usersPage.active'));
              } else {
                angular.element('.icon-' + user.id).html($filter('translate')('usersPage.inactive'));
              }
            } else if (userStatus === 404) {
              entitleResult.msg = 'Entitlements for ' + data.userResponse[0].email + ' do not exist.';
              entitleResult.type = 'error';
            } else if (userStatus === 409) {
              entitleResult.msg = 'Entitlement(s) previously updated.';
              entitleResult.type = 'error';
            } else {
              entitleResult.msg = data.userResponse[0].email + '\'s entitlements were not updated, status: ' + userStatus;
              entitleResult.type = 'error';
            }
            Notification.notify([entitleResult.msg], entitleResult.type);
            angular.element('#btn-save').button('reset');

            var index = $scope.queryuserslist.map(function (element) {
              return element.id;
            }).indexOf($scope.currentUser.id);
            var updatedUser = $scope.queryuserslist[index];
            for (var i = 0; i < $rootScope.services.length; i++) {
              var service = $rootScope.services[i].sqService;
              var ciService = $rootScope.services[i].ciService;
              if ($scope.entitlements[service] === true && updatedUser.entitlements.indexOf(ciService) === -1) {
                updatedUser.entitlements.push(ciService);
              } else if ($scope.entitlements[service] === false && updatedUser.entitlements.indexOf(ciService) > -1) {
                updatedUser.entitlements.splice(updatedUser.entitlements.indexOf(ciService), 1);
              }
            }
            $rootScope.$broadcast('entitlementsUpdated');
          } else {
            Log.error('Failed updating user with entitlements.');
            Log.error(data);
            entitleResult = {
              msg: 'Failed to update ' + user.userName + '\'s entitlements.',
              type: 'error'
            };
            Notification.notify([entitleResult.msg], entitleResult.type);
            angular.element('#btn-save').button('reset');
          }
        });
      };

      watchCheckboxes();
    }
  ])
  .directive('userEntitlements', function () {
    return {
      restrict: 'A',
      controller: 'UserEntitlementsCtrl',
      scope: {
        currentUser: '=',
        entitlements: '=',
        queryuserslist: '='
      },
      templateUrl: 'modules/squared/scripts/directives/views/userentitlements.html'
    };
  });
