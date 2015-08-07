'use strict';

//TODO refactor this into OnboardCtrl, BulkUserCtrl, AssignServicesCtrl
angular.module('Core')
  .controller('OnboardCtrl', ['$scope', '$state', '$stateParams', '$q', '$window', 'Log', '$log', 'Authinfo', 'Storage', '$rootScope', '$translate', 'LogMetricsService', 'Config', 'GroupService', 'Notification', 'Userservice', 'HuronUser', '$timeout', 'Utils', 'Orgservice',
    function ($scope, $state, $stateParams, $q, $window, Log, $log, Authinfo, Storage, $rootScope, $translate, LogMetricsService, Config, GroupService, Notification, Userservice, HuronUser, $timeout, Utils, Orgservice) {

      $scope.hasAccount = Authinfo.hasAccount();

      // model can be removed after switching to controllerAs
      $scope.model = {
        userInputOption: 0,
        uploadProgress: 0
      };

      $scope.strFirstName = $translate.instant('usersPage.firstNamePlaceHolder');
      $scope.strLastName = $translate.instant('usersPage.lastNamePlaceHolder');
      $scope.strEmailAddress = $translate.instant('usersPage.emailAddressPlaceHolder');
      var strNameAndEmailAdress = $translate.instant('usersPage.nameAndEmailAddress');
      $scope.userInputOptions = [{
        label: $scope.strEmailAddress,
        value: 0,
        name: 'radioOption',
        id: 'radioEmail'
      }, {
        label: strNameAndEmailAdress,
        value: 1,
        name: 'radioOption',
        id: 'radioNamesAndEmail'
      }];

      function clearNameAndEmailFields() {
        $scope.model.firstName = '';
        $scope.model.lastName = '';
        $scope.model.emailAddress = '';
        $scope.model.userInfoValid = false;
      }

      function ServiceFeature(label, value, name, license) {
        this.label = label;
        this.value = value;
        this.name = name;
        this.license = license;
      }

      function FakeLicense(type) {
        this.licenseType = type;
        this.features = Config.getDefaultEntitlements();
      }

      $scope.ConfirmAdditionalServiceSetup = function () {
        var promise = (Notification.confirmation($translate.instant('usersPage.addtionalServiceSetupConfirmation')));
        promise.then(function () {
          $state.go('firsttimewizard');
        });
      };

      $scope.disableCommFeatureAssignment = function () {
        // disable the communication feature assignment unless the UserAdd is part of the First Time Setup Wizard work flow
        return (!Authinfo.isSetupDone() && ((typeof $state.current.data === 'undefined') || (!$state.current.data.firstTimeSetup)));
      };

      var userEnts = null;
      var userLicenseIds = null;
      $scope.cmrFeature = null;
      $scope.messageFeatures = [];
      $scope.conferenceFeatures = [];
      $scope.communicationFeatures = [];
      $scope.licenses = [];
      var convertSuccess = [];
      var convertFailures = [];

      $scope.messageFeatures.push(new ServiceFeature($translate.instant('onboardModal.freeMsg'), 0, 'msgRadio', new FakeLicense('freeTeamRoom')));
      $scope.conferenceFeatures.push(new ServiceFeature($translate.instant('onboardModal.freeConf'), 0, 'confRadio', new FakeLicense('freeConferencing')));
      $scope.communicationFeatures.push(new ServiceFeature($translate.instant('onboardModal.freeComm'), 0, 'commRadio', new FakeLicense('advancedCommunication')));
      $scope.currentUser = $stateParams.currentUser;

      if ($scope.currentUser) {
        userEnts = $scope.currentUser.entitlements;
        userLicenseIds = $scope.currentUser.licenseID;
      }

      var populateConf = function () {
        if (userLicenseIds) {

          for (var ids in userLicenseIds) {
            var currentId = userLicenseIds[ids];

            for (var conf in $scope.confChk) {
              var currentConf = $scope.confChk[conf];

              if (currentConf.confFeature) {
                if (currentConf.confFeature.license.licenseId === currentId) {
                  currentConf.confModel = true;
                }
              }

              if (currentConf.cmrFeature) {
                if (currentConf.cmrFeature.license.licenseId === currentId) {
                  currentConf.cmrModel = true;
                }
              }
            }
          }
        }
      };

      $scope.radioStates = {
        commRadio: false,
        confRadio: false,
        msgRadio: false,
        subLicense: {}
      };

      if (userEnts) {
        for (var x = 0; x < userEnts.length; x++) {
          if (userEnts[x] === 'ciscouc') {
            $scope.radioStates.commRadio = true;
          } else if (userEnts[x] === 'squared-room-moderation') {
            $scope.radioStates.msgRadio = true;
          }
        }
      }

      var generateConfChk = function (confs, cmrs) {
        $scope.confChk = [];
        for (var i in confs) {
          var temp = {
            confFeature: confs[i],
            confModel: false,
            confId: 'conf-' + i
          };

          for (var j in cmrs) {
            if (!_.isUndefined(cmrs[j]) && !_.isNull(cmrs[j]) && !_.isUndefined(confs[i].license.siteUrl)) {
              if (_.isEqual(confs[i].license.siteUrl, cmrs[j].license.siteUrl) && _.isEqual(confs[i].license.billingServiceId, cmrs[j].license.billingServiceId)) {
                temp.cmrFeature = cmrs[j];
                temp.cmrModel = false;
                temp.cmrId = 'cmr-' + j;
              }
            }
          }

          $scope.confChk.push(temp);
        }

        populateConf();
      };

      $scope.isSubscribeable = function (license) {
        if (license.status === 'ACTIVE' || license.status === 'PENDING') {
          return (license.volume > 0);
        }
        return false;
      };

      // [Services] -> [Services] (merges Service[s] w/ same license)
      var mergeMultipleLicenseSubscriptions = function (fetched) {

        // Construct a mapping from License to (array of) Service object(s)
        var services = fetched.reduce(function (object, service) {
          var key = service.license.licenseType;
          if (key in object) {
            object[key].push(service);
          } else {
            object[key] = [service];
          }
          return object;
        }, {});

        // Merge all services with the same License into a single Service
        return _.values(services).map(function (array) {
          var result = {
            licenses: []
          };
          array.forEach(function (service) {
            var copy = angular.copy(service);
            copy.licenses = [copy.license];
            delete copy.license;
            _.merge(result, copy, function (left, right) {
              if (_.isArray(left)) return left.concat(right);
            });
          });
          return result;
        });

      };

      var getAccountServices = function () {
        var services = {
          message: Authinfo.getMessageServices(),
          conference: Authinfo.getConferenceServices(),
          communication: Authinfo.getCommunicationServices()
        };
        if (services.message) {
          services.message = mergeMultipleLicenseSubscriptions(services.message);
          $scope.messageFeatures = $scope.messageFeatures.concat(services.message);
        }
        if (services.conference) {
          $scope.cmrFeatures = Authinfo.getCmrServices();
          $scope.conferenceFeatures = $scope.conferenceFeatures.concat(services.conference);
          generateConfChk($scope.conferenceFeatures, $scope.cmrFeatures);
        }
        if (services.communication) {
          $scope.communicationFeatures = $scope.communicationFeatures.concat(services.communication);
        }
      };

      if (Authinfo.isInitialized()) {
        getAccountServices();
      }

      $scope.groups = [];
      GroupService.getGroupList(function (data, status) {
        if (data.success) {
          $scope.groups = data.groups;
          if (data.groups && data.groups.length === 0) {
            var defaultGroup = {
              displayName: 'Default License Group'
            };
            data.groups.push(defaultGroup);
          }
          $scope.selectedGroup = $scope.groups[0];
        } else {
          Log.debug('Failed to retrieve group list. Status: ' + status);
          Notification.notify([$translate.instant('onboardModal.apiError', {
            status: status
          })], 'error');
        }
      });

      $scope.collabRadio1 = {
        label: $translate.instant('onboardModal.enableCollab'),
        value: 1,
        name: 'collabRadio',
        id: 'collabRadio1'
      };

      $scope.collabRadio2 = {
        label: $translate.instant('onboardModal.enableCollabGroup'),
        value: 2,
        name: 'collabRadio',
        id: 'collabRadio2'
      };

      $scope.gridOptions = {
        data: 'groups',
        rowHeight: 44,
        headerRowHeight: 44,
        multiSelect: false,
        sortInfo: {
          fields: ['displayName'],
          directions: ['asc']
        },

        columnDefs: [{
          field: 'displayName',
          displayName: $translate.instant('onboardModal.groupColHeader'),
          sortable: true
        }]
      };

      $scope.collabRadio = 1;

      $scope.onboardUsers = onboardUsers;

      var usersList = [];

      var getConfIdList = function () {
        var confId = [];
        for (var cf in $scope.confChk) {
          var current = $scope.confChk[cf];
          if (current.confModel === true) {
            confId.push(current.confFeature.license.licenseId);
          }
          if (current.cmrModel === true) {
            confId.push(current.cmrFeature.license.licenseId);
          }
        }
        return confId;
      };

      var getAccountLicenseIds = function () {
        var licenseIdList = [];
        if (Authinfo.hasAccount()) {
          // Messaging: prefer selected subscription, if specified
          if ('licenseId' in $scope.radioStates.subLicense) {
            licenseIdList.push($scope.radioStates.subLicense.licenseId);
          } else {
            var msgIndex = $scope.radioStates.msgRadio ? 1 : 0;
            var selMsgService = $scope.messageFeatures[msgIndex];
            // TODO (tohagema): clean up messageFeatures license(s) model :/
            var license = selMsgService.license || selMsgService.licenses[0];
            if ('licenseId' in license) licenseIdList.push(license.licenseId);
          }
          // Conferencing: depends on model (standard vs. CMR)
          licenseIdList = licenseIdList.concat(getConfIdList());
          // Communication: straightforward license, for now
          var commIndex = $scope.radioStates.commRadio ? 1 : 0;
          var selCommService = $scope.communicationFeatures[commIndex];
          if ('licenseId' in selCommService.license) {
            licenseIdList.push(selCommService.license.licenseId);
          }
        }
        return licenseIdList.length === 0 ? null : licenseIdList;
      };

      var getEntitlements = function (action) {
        var entitleList = [];
        var state = null;
        for (var key in $scope.entitlements) {
          state = $scope.entitlements[key];
          if ((action === 'add' && state) || (action === 'entitle' && state)) {
            entitleList.push(new Feature(key, state));
          }
        }

        Log.debug(entitleList);
        return entitleList;
      };

      var getEntitlementStrings = function (entList) {
        var entStrings = [];
        for (var e = 0; e < entList.length; e++) {
          if (entList[e].entitlementName) {
            entStrings.push(entList[e].entitlementName);
          }
        }
        return entStrings;
      };

      $scope.updateUserLicense = function () {
        var user = [];
        if ($scope.currentUser) {
          usersList = [];
          var userObj = {
            'address': $scope.currentUser.userName,
            'name': $scope.currentUser.name
          };
          user.push(userObj);
          usersList.push(user);
        }
        angular.element('#btnSaveEnt').button('loading');

        Userservice.updateUsers(user, getAccountLicenseIds(), null, 'updateUserLicense', entitleUserCallback);
      };

      //****************MODAL INIT FUNCTION FOR INVITE AND ADD***************
      //***
      //***
      //*********************************************************************

      function Feature(name, state) {
        this.entitlementName = name;
        this.entitlementState = state ? 'ACTIVE' : 'INACTIVE';
      }

      $scope.isAddEnabled = function () {
        return Authinfo.isAddUserEnabled();
      };

      $scope.isEntitleEnabled = function () {
        return Authinfo.isEntitleUserEnabled();
      };

      //email validation logic
      var validateEmail = function (input) {
        var emailregex = /\S+@\S+\.\S+/;
        var emailregexbrackets = /<\s*\S+@\S+\.\S+\s*>/;
        var emailregexquotes = /"\s*\S+@\S+\.\S+\s*"/;
        var valid = false;

        if (/[<>]/.test(input) && emailregexbrackets.test(input)) {
          valid = true;
        } else if (/["]/.test(input) && emailregexquotes.test(input)) {
          valid = true;
        } else if (!/[<>]/.test(input) && !/["]/.test(input) && emailregex.test(input)) {
          valid = true;
        }

        return valid;
      };

      var wizardNextText = function () {
        var userCount = angular.element('.token-label').length;
        var action = 'finish';
        if (userCount > 0) {
          action = 'next';
        }
        $scope.$emit('wizardNextText', action);
      };

      $scope.tokenfieldid = "usersfield";
      $scope.tokenplaceholder = $translate.instant('usersPage.userInput');
      $scope.tokenoptions = {
        delimiter: [',', ';'],
        createTokensOnBlur: true
      };
      $scope.tokenmethods = {
        createtoken: function (e) {
          //Removing anything in brackets from user data
          var value = e.attrs.value.replace(/\s*\([^)]*\)\s*/g, ' ');
          e.attrs.value = value;
        },
        createdtoken: function (e) {
          if (!validateEmail(e.attrs.value)) {
            angular.element(e.relatedTarget).addClass('invalid');
            invalidcount++;
          }
          wizardNextText();
          checkPlaceholder();
        },
        edittoken: function (e) {
          if (!validateEmail(e.attrs.value)) {
            invalidcount--;
          }
        },
        removedtoken: function (e) {
          if (!validateEmail(e.attrs.value)) {
            invalidcount--;
          }
          wizardNextText();
          checkPlaceholder();
        }
      };

      var invalidcount = 0;
      var startLog;

      var setPlaceholder = function (placeholder) {
        angular.element('.tokenfield.form-control #usersfield-tokenfield').attr('placeholder', placeholder);
      };

      //placeholder logic
      var checkPlaceholder = function () {
        if (angular.element('.token-label').length > 0) {
          setPlaceholder('');
        } else {
          setPlaceholder($translate.instant('usersPage.userInput'));
        }
      };

      var getUsersList = function () {
        return $window.addressparser.parse($scope.model.userList);
      };

      $scope.validateTokensBtn = function () {
        var usersListLength = angular.element('.token-label').length;
        $scope.validateTokens().then(function () {
          if (invalidcount === 0 && usersListLength > 0) {
            $state.go('users.add.services');
          } else if (usersListLength === 0) {
            Log.debug('No users entered.');
            Notification.notify([$translate.instant('usersPage.noUsersInput')], 'error');
          } else {
            Log.debug('Invalid users entered.');
            Notification.notify([$translate.instant('usersPage.validEmailInput')], 'error');
          }
        });
      };

      $scope.validateTokens = function () {
        wizardNextText();
        return $timeout(function () {
          var tokenfield = angular.element('#usersfield');
          //reset the invalid count
          invalidcount = 0;
          angular.element('#usersfield').tokenfield('setTokens', $scope.model.userList);
        }, 100);
      };

      $scope.addToUsersfield = function () {
        if ($scope.model.userForm.$valid && $scope.model.userInfoValid) {
          var userInfo = $scope.model.firstName + ' ' + $scope.model.lastName + '  ' + $scope.model.emailAddress;
          angular.element('#usersfield').tokenfield('createToken', userInfo);
          clearNameAndEmailFields();
          angular.element('#firstName').focus();
        }
      };

      $scope.validateEmailField = function () {
        if ($scope.model.emailAddress) {
          $scope.model.userInfoValid = validateEmail($scope.model.emailAddress);
        } else {
          $scope.model.userInfoValid = false;
        }
      };

      $scope.onEnterKey = function (keyEvent) {
        if (keyEvent.which === 13) {
          $scope.addToUsersfield();
        }
      };

      var resetUsersfield = function () {
        angular.element('#usersfield').tokenfield('setTokens', ' ');
        $scope.model.userList = '';
        checkPlaceholder();
        invalidcount = 0;
      };

      $scope.clearPanel = function () {
        resetUsersfield();
        $scope.radioStates.subLicense = {};
        $scope.results = null;
      };

      function onboardUsers(optionalOnboard) {
        var deferred = $q.defer();
        $scope.results = {
          resultList: []
        };
        var isComplete = true;
        usersList = getUsersList();
        Log.debug('Entitlements: ', usersList);
        var callback = function (data, status) {
          if (data.success) {
            Log.info('User onboard request returned:', data);
            $rootScope.$broadcast('USER_LIST_UPDATED');
            var promises = [];
            var numAddedUsers = 0;

            for (var num = 0; num < data.userResponse.length; num++) {
              if (data.userResponse[num].status === 200) {
                numAddedUsers++;
              }
            }

            if (numAddedUsers > 0) {
              var msg = 'Invited ' + numAddedUsers + ' users';
              LogMetricsService.logMetrics(msg, LogMetricsService.getEventType('inviteUsers'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), numAddedUsers);
            }

            for (var i = 0; i < data.userResponse.length; i++) {
              var userResult = {
                email: data.userResponse[i].email,
                alertType: null
              };

              var userStatus = data.userResponse[i].status;

              if (userStatus === 200) {
                userResult.message = $translate.instant('usersPage.onboardSuccess', userResult);
                userResult.alertType = 'success';
                var promise;
                if (data.userResponse[i].entitled && data.userResponse[i].entitled.indexOf(Config.entitlements.huron) !== -1) {
                  var userData = {
                    'email': data.userResponse[i].email,
                    'name': data.userResponse[i].name
                  };
                  promise = HuronUser.create(data.userResponse[i].uuid, userData)
                    .catch(function (response) {
                      this.alertType = 'danger';
                      this.message = Notification.processErrorResponse(response, 'usersPage.ciscoucError', this);
                    }.bind(userResult));
                  promises.push(promise);
                }
                if (data.userResponse[i].unentitled && data.userResponse[i].unentitled.indexOf(Config.entitlements.huron) !== -1) {
                  promise = HuronUser.delete(data.userResponse[i].uuid)
                    .catch(function (response) {
                      // If the user does not exist in Squared UC do not report an error
                      if (response.status !== 404) {
                        // Notify Huron error
                        Notification.errorResponse(response);
                      }
                    });
                  promises.push(promise);
                }
              } else if (userStatus === 409) {
                userResult.message = userResult.email + ' ' + data.userResponse[i].message;
                userResult.alertType = 'danger';
                isComplete = false;
              } else {
                userResult.message = $translate.instant('usersPage.onboardError', {
                  email: userResult.email,
                  status: userStatus
                });
                userResult.alertType = 'danger';
                isComplete = false;
              }
              $scope.results.resultList.push(userResult);
            }

            $q.all(promises).then(function () {
              //concatenating the results in an array of strings for notify function
              var successes = [];
              var errors = [];
              var count_s = 0;
              var count_e = 0;
              for (var idx in $scope.results.resultList) {
                if ($scope.results.resultList[idx].alertType === 'success') {
                  successes[count_s] = $scope.results.resultList[idx].message;
                  count_s++;
                } else {
                  errors[count_e] = $scope.results.resultList[idx].message;
                  count_e++;
                }
              }
              //Displaying notifications
              if (successes.length + errors.length === usersList.length) {
                angular.element('#btnOnboard').button('reset');
                Notification.notify(successes, 'success');
                Notification.notify(errors, 'error');
                deferred.resolve();
              }
              if (angular.isFunction($scope.$dismiss) && successes.length === usersList.length) {
                $scope.$dismiss();
              }
            });

          } else {
            Log.warn('Could not onboard the user', data);
            var error = null;
            if (status) {
              error = $translate.instant('errors.statusError', {
                status: status
              });
              if (data && angular.isString(data.message)) {
                error += ' ' + $translate.instant('usersPage.messageError', {
                  message: data.message
                });
              }
            } else {
              error = 'Request failed.';
              if (angular.isString(data)) {
                error += ' ' + data;
              }
              Notification.notify(error, 'error');
            }
            Notification.notify([error], 'error');
            isComplete = false;
            angular.element('#btnOnboard').button('reset');
            deferred.reject();
          }

          if (isComplete) {
            resetUsersfield();
          }

        };

        if (angular.isArray(usersList) && usersList.length > 0) {
          angular.element('#btnOnboard').button('loading');

          var i, temparray, chunk = Config.batchSize;
          for (i = 0; i < usersList.length; i += chunk) {
            temparray = usersList.slice(i, i + chunk);
            //update entitlements
            var entitleList = [];
            var licenseList = [];
            if (Authinfo.hasAccount() && $scope.collabRadio === 1) {
              licenseList = getAccountLicenseIds();
            } else {
              entitleList = getEntitlements('add');
            }
            Userservice.onboardUsers(temparray, entitleList, licenseList, callback);
          }
        } else if (!optionalOnboard) {
          Log.debug('No users entered.');
          var error = [$translate.instant('usersPage.validEmailInput')];
          Notification.notify(error, 'error');
          deferred.reject();
        } else {
          deferred.resolve();
        }
        return deferred.promise;
      }

      var entitleUserCallback = function (data, status, method) {
        $scope.results = {
          resultList: []
        };
        var isComplete = true;

        $rootScope.$broadcast('USER_LIST_UPDATED');
        if (data.success) {
          Log.info('User successfully updated', data);

          for (var i = 0; i < data.userResponse.length; i++) {

            var userResult = {
              email: data.userResponse[i].email,
              alertType: null
            };

            var userStatus = data.userResponse[i].status;

            if (userStatus === 200) {
              userResult.message = 'entitled successfully';
              userResult.alertType = 'success';
            } else if (userStatus === 404) {
              userResult.message = 'does not exist';
              userResult.alertType = 'danger';
              isComplete = false;
            } else if (userStatus === 409) {
              userResult.message = 'entitlement previously updated';
              userResult.alertType = 'danger';
              isComplete = false;
            } else {
              userResult.message = 'not entitled, status: ' + userStatus;
              userResult.alertType = 'danger';
              isComplete = false;
            }
            $scope.results.resultList.push(userResult);
            if (method !== 'convertUser') {
              $scope.$dismiss();
            }
          }

          //concatenating the results in an array of strings for notify function
          var successes = [];
          var errors = [];
          var count_s = 0;
          var count_e = 0;
          for (var idx in $scope.results.resultList) {
            if ($scope.results.resultList[idx].alertType === 'success') {
              successes[count_s] = $scope.results.resultList[idx].email + ' ' + $scope.results.resultList[idx].message;
              count_s++;
            } else {
              errors[count_e] = $scope.results.resultList[idx].email + ' ' + $scope.results.resultList[idx].message;
              count_e++;
            }
          }

          //Displaying notifications
          if (method !== 'convertUser') {
            if (successes.length + errors.length === usersList.length) {
              angular.element('#btnOnboard').button('reset');
              angular.element('#btnSaveEnt').button('reset');
              Notification.notify(successes, 'success');
              Notification.notify(errors, 'error');
            }
          } else {
            if (count_s > 0) {
              convertSuccess.push.apply(convertSuccess, successes);
            }
            if (count_e > 0) {
              convertFailures.push.apply(convertFailures, errors);
            }
          }

        } else {
          Log.warn('Could not entitle the user', data);
          var error = null;
          if (status) {
            error = $translate.instant('error.statusError', {
              status: status
            });
            if (data && angular.isString(data.message)) {
              error += ' ' + $translate.instant('usersPage.messageError', {
                message: data.message
              });
            }
          } else {
            error = 'Request failed.';
            if (angular.isString(data)) {
              error += ' ' + data;
            }
          }
          if (method !== 'convertUser') {
            Notification.notify([error], 'error');
            isComplete = false;
            angular.element('#btnOnboard').button('reset');
            angular.element('#btnSaveEnt').button('reset');
          } else {
            convertFailures.push(error);
          }
        }

        if (method !== 'convertUser') {
          if (isComplete) {
            resetUsersfield();
          }
        } else {
          if ($scope.convertSelectedList.length > 0) {
            convertUsersInBatch();
          } else {
            angular.element('#btnConvert').button('reset');
            Notification.notify(convertSuccess, 'success');
            Notification.notify(convertFailures, 'error');
            $scope.$dismiss();
          }
        }

      };

      //radio group
      $scope.entitlements = {};
      var setEntitlementList = function () {
        if (angular.isArray($rootScope.services)) {
          for (var i = 0; i < $rootScope.services.length; i++) {
            var svc = $rootScope.services[i].serviceId;

            $scope.entitlements[svc] = false;
            if (svc === 'webExSquared') {
              $scope.entitlements[svc] = true;
            }
          }
        }
        $scope.entitlementsKeys = Object.keys($scope.entitlements).sort().reverse();
      };

      $scope.$on('AuthinfoUpdated', function () {
        if (angular.isArray($rootScope.services) && $rootScope.services.length === 0) {
          $rootScope.services = Authinfo.getServices();
        }
        setEntitlementList();
      });

      // Wizard hook for next button
      $scope.manualEntryNext = function () {
        var deferred = $q.defer();

        if (getUsersList().length === 0) {
          $q.when($scope.wizard.nextTab()).then(function () {
            deferred.reject();
          });
        } else {
          if (invalidcount === 0) {
            deferred.resolve();
          } else {
            var error = [$translate.instant('usersPage.validEmailInput')];
            Notification.notify(error, 'error');
            deferred.reject();
          }
        }
        return deferred.promise;
      };
      // Wizard hook for save button
      $scope.assignServicesNext = function () {
        return onboardUsers(true);
      };

      $scope.isServiceAllowed = function (service) {
        return Authinfo.isServiceAllowed(service);
      };

      $scope.getServiceName = function (service) {
        for (var i = 0; i < $rootScope.services.length; i++) {
          var svc = $rootScope.services[i];
          if (svc.serviceId === service) {
            return svc.displayName;
          }
        }
      };

      $scope.shouldAddIndent = function (key, reference) {
        return key !== reference;
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
      };

      //set intitially when loading the page
      //on initial login the AuthinfoUpdated broadcast may not be caught if not on user page
      setEntitlementList();
      watchCheckboxes();

      $scope.saveConvertList = function () {
        $scope.convertSelectedList = $scope.convertGridOptions.$gridScope.selectedItems;
        $scope.convertUsersFlow = true;
        $state.go('users.convert.services', {});
      };

      $scope.convertUsers = function () {
        angular.element('#btnConvert').button('loading');
        convertSuccess = [];
        convertFailures = [];
        convertUsersInBatch();
      };

      var convertUsersInBatch = function () {
        var batch = $scope.convertSelectedList.slice(0, Config.batchSize);
        $scope.convertSelectedList = $scope.convertSelectedList.slice(Config.batchSize);
        Userservice.migrateUsers(batch, function (data, status) {
          var successMovedUsers = [];

          for (var i = 0; i < data.userResponse.length; i++) {
            if (data.userResponse[i].status !== 200) {
              convertFailures.push(data.userResponse[i].email + $translate.instant('homePage.convertError'));
            } else {
              var user = {
                'address': data.userResponse[i].email
              };
              successMovedUsers.push(user);
            }
          }

          if (successMovedUsers.length > 0) {
            var entitleList = [];
            var licenseList = [];
            if (Authinfo.hasAccount() && $scope.collabRadio === 1) {
              licenseList = getAccountLicenseIds();
            } else {
              entitleList = getEntitlements('add');
            }
            Userservice.updateUsers(successMovedUsers, licenseList, entitleList, 'convertUser', entitleUserCallback);
          } else {
            if ($scope.convertSelectedList.length > 0) {
              convertUsersInBatch();
            } else {
              angular.element('#btnConvert').button('reset');
              Notification.notify(convertSuccess, 'success');
              Notification.notify(convertFailures, 'error');
              $scope.$dismiss();
            }
          }
        });
      };

      var getUnlicensedUsers = function () {
        Orgservice.getUnlicensedUsers(function (data) {
          $scope.unlicensed = 0;
          $scope.unlicensedUsersList = null;
          if (data.success) {
            if (data.totalResults) {
              $scope.unlicensed = data.totalResults;
              $scope.unlicensedUsersList = data.resources;
            }
          }
        });
      };

      $scope.convertDisabled = function () {
        return ($scope.convertGridOptions.$gridScope.selectedItems.length === 0) ? true : false;
      };

      getUnlicensedUsers();

      var givenNameTemplate = '<div class="ngCellText"><p class="hoverStyle" title="{{row.entity.name.givenName}}">{{row.entity.name.givenName}}</p></div>';
      var familyNameTemplate = '<div class="ngCellText"><p class="hoverStyle" title="{{row.entity.name.familyName}}">{{row.entity.name.familyName}}</p></div>';
      var emailTemplate = '<div class="ngCellText"><p class="hoverStyle" title="{{row.entity.userName}}">{{row.entity.userName}}</p></div>';

      $scope.convertGridOptions = {
        data: 'unlicensedUsersList',
        rowHeight: 45,
        headerRowHeight: 45,
        enableHorizontalScrollbar: 0,
        enableVerticalScrollbar: 2,
        showSelectionCheckbox: true,
        sortInfo: {
          fields: ['userName'],
          directions: ['desc']
        },
        selectedItems: [],
        columnDefs: [{
          field: 'name.givenName',
          displayName: $translate.instant('usersPage.firstnameHeader'),
          cellTemplate: givenNameTemplate,
          resizable: false,
          sortable: true
        }, {
          field: 'name.familyName',
          displayName: $translate.instant('usersPage.lastnameHeader'),
          cellTemplate: familyNameTemplate,
          resizable: false,
          sortable: true
        }, {
          field: 'userName',
          displayName: $translate.instant('homePage.emailAddress'),
          cellTemplate: emailTemplate,
          resizable: false,
        }]
      };

      // Bulk CSV Onboarding logic
      var userArray = [];
      var isCsvValid = false;
      var cancelDeferred;
      var saveDeferred;
      var MAX_USERS = 1000;

      $scope.onFileSizeError = function () {
        Notification.notify([$translate.instant('firstTimeWizard.csvMaxSizeError')], 'error');
      };

      $scope.onFileTypeError = function () {
        Notification.notify([$translate.instant('firstTimeWizard.csvFileTypeError')], 'error');
      };

      $scope.$watch('model.file', function (value) {
        $timeout(validateCsv);
      });
      $scope.resetFile = resetFile;

      function validateCsv() {
        if ($scope.model.file) {
          setUploadProgress(0);
          userArray = $.csv.toArrays($scope.model.file);
          if (angular.isArray(userArray) && userArray.length > 0) {
            if (userArray[0][0] === 'First Name') {
              userArray.shift();
            }
            if (userArray.length > 0 && userArray.length <= MAX_USERS) {
              isCsvValid = true;
            }
          }
          setUploadProgress(100);
        } else {
          isCsvValid = false;
        }
      }

      function setUploadProgress(percent) {
        $scope.model.uploadProgress = percent;
        $scope.$digest();
      }

      function resetFile() {
        $scope.model.file = null;
      }

      // Wizard hook
      $scope.csvUploadNext = function () {
        var deferred = $q.defer();

        if (isCsvValid) {
          deferred.resolve();
        } else {
          var error;
          if (userArray.length > MAX_USERS) {
            error = [$translate.instant('firstTimeWizard.csvMaxLinesError')];
          } else {
            error = [$translate.instant('firstTimeWizard.uploadCsvEmpty')];
          }
          Notification.notify(error, 'error');
          deferred.reject();
        }

        return deferred.promise;
      };

      // Wizard hook
      $scope.csvProcessingNext = csvSave;

      function csvSave() {
        saveDeferred = $q.defer();
        cancelDeferred = $q.defer();

        var chunk = Config.batchSize;
        var tempUserArray = [];
        var tempLicenseArray = [];
        $scope.model.userErrorArray = [];
        $scope.model.numMaxUsers = userArray.length;
        $scope.model.processProgress = $scope.model.numTotalUsers = $scope.model.numNewUsers = $scope.model.numExistingUsers = 0;

        function addUserError(row, errorMsg) {
          $scope.model.userErrorArray.push({
            row: row,
            error: errorMsg
          });
        }

        function callback(data, status) {
          /*jshint validthis:true */
          var params = this;
          if (data.success) {
            if (angular.isArray(data.userResponse)) {
              angular.forEach(data.userResponse, function (user, index) {
                if (user.status === 200) {
                  if (user.message === 'User Patched') {
                    $scope.model.numExistingUsers++;
                  } else {
                    $scope.model.numNewUsers++;
                  }
                } else {
                  addUserError(params.startIndex + index + 1, user.message);
                }
              });
            } else {
              for (var i = 0; i < params.length; i++) {
                addUserError(params.startIndex + i + 1, $translate.instant('firstTimeWizard.processCsvResponseError'));
              }
            }
          } else {
            for (var k = 0; k < params.length; k++) {
              addUserError(params.startIndex + k + 1, $translate.instant('firstTimeWizard.processCsvError'));
            }
          }

          calculateProcessProgress();
        }

        // Get license/entitlements
        var entitleList = [];
        var licenseList = [];
        if (Authinfo.hasAccount() && $scope.collabRadio === 1) {
          licenseList = getAccountLicenseIds() || [];
        } else {
          entitleList = getEntitlements('add');
        }

        function buildLicenseArray(internalExtension, directLine) {
          return licenseList.map(function (license) {
            var licenseObj = {
              id: license,
              properties: {}
            };
            if (license.indexOf("CO_") === 0) {
              if (internalExtension) {
                licenseObj.properties.internalExtension = internalExtension;
              }
              if (directLine) {
                licenseObj.properties.directLine = directLine;
              }
            }
            return licenseObj;
          });
        }

        function onboardCsvUsers(startIndex) {
          if (tempUserArray.length > 0) {
            Userservice.onboardLicenseUsers(tempUserArray, entitleList, tempLicenseArray, callback.bind({
              startIndex: startIndex - tempUserArray.length + 1,
              length: tempUserArray.length
            }), cancelDeferred.promise);
            tempUserArray = [];
            tempLicenseArray = [];
          }
        }

        function calculateProcessProgress() {
          $scope.model.numTotalUsers = $scope.model.numNewUsers + $scope.model.numExistingUsers + $scope.model.userErrorArray.length;
          $scope.model.processProgress = Math.round($scope.model.numTotalUsers / userArray.length * 100);

          if ($scope.model.numTotalUsers >= userArray.length) {
            $scope.model.userErrorArray.sort(function (a, b) {
              return a.row - b.row;
            });
            $rootScope.$broadcast('USER_LIST_UPDATED');
            resetFile();
            saveDeferred.resolve();
          }
        }

        // Onboard users in chunks
        // Separate chunks on invalid rows
        for (var j = 0; j < userArray.length; j++) {
          if (tempUserArray.length < chunk) {
            if (userArray[j].length === 6) {
              tempUserArray.push({
                address: userArray[j][3],
                name: userArray[j][2]
              });
              tempLicenseArray.push(buildLicenseArray(userArray[j][4], userArray[j][5]));
            } else {
              addUserError(j + 1, $translate.instant('firstTimeWizard.csvInvalidRow'));
              onboardCsvUsers(j - 1);
              continue;
            }
          }
          if (tempUserArray.length === chunk || j === (userArray.length - 1)) {
            onboardCsvUsers(j);
          }
        }

        calculateProcessProgress();

        return saveDeferred.promise;
      }

      $scope.cancelProcessCsv = function () {
        cancelDeferred.resolve();
        saveDeferred.resolve();
      };

      $scope.gridOptions = {
        data: 'model.userErrorArray',
        multiSelect: false,
        showFilter: false,
        rowHeight: 44,
        // rowTemplate: rowTemplate,
        headerRowHeight: 44,
        useExternalSorting: false,
        enableRowSelection: false,

        columnDefs: [{
          field: 'row',
          displayName: $translate.instant('firstTimeWizard.resultRowHeader'),
          sortable: true,
        }, {
          field: 'error',
          displayName: $translate.instant('firstTimeWizard.resultErrorHeader'),
          sortable: true
        }]
      };
    }
  ]);
