'use strict';
/* global moment, $:false */

angular.module('Core')
  .controller('AddUserCtrl', ['$scope', '$location', 'DirSyncService', 'Log', '$translate', 'Notification', 'UserListService', 'Storage', 'Auth', 'Utils', '$filter', 'Userservice', 'LogMetricsService', '$window', 'Config',
    function($scope, $location, DirSyncService, Log, $translate, Notification, UserListService, Storage, Auth, Utils, $filter, Userservice, LogMetricsService, $window, Config) {

			//Populating authinfo data if empty.
      var token = Storage.get('accessToken');
      if (Auth.isAuthorizedFtwPath($scope)) {
        Log.debug('Authinfo data is loaded.');
      }

      //Initialize
      Notification.init($scope);
      $scope.popup = Notification.popup;

			var allSteps = ['chooseSync', 'domain', 'installCloud', 'syncStatus', 'manual'];
			var manualSteps = ['manual'];
			var dirsyncSteps = ['domain', 'installCloud', 'syncStatus'];

	    for(var stepNum in allSteps) {
				var step = allSteps[stepNum];
				if(step !== 'chooseSync') {
					$('#'+step).addClass('ng-hide');
					$('#'+step+'Tab').addClass('ng-hide');
        } else {
					$('#'+step).addClass('ng-show');
					$('#'+step+'Tab').addClass('ng-show');
					$('#'+step+'Tab').addClass('tabHighlight');
        }
      }

      $scope.numUsersInSync = '0';
      $scope.domainExists = true;
      $scope.domain = '';
      $scope.dirsyncStatus = '';
      $scope.gridOptions = { data: 'userList',
                             multiSelect: false };


	    $scope.chooseNextStep = function() {
				var syncOption = $scope.chooseSync;
				if(syncOption === 'dirsync') {
					$scope.showStep('domain');
				} else if (syncOption === 'manual') {
					$scope.showStep('manual');
				}	else {
					Notification.notify([$translate.instant('firstTimeWizard.chooseSync', {
              status: status
            })], 'error');
				}
	    };

	    $scope.chooseSkipStep = function() {
				$location.path('/home');
	    };

	    $scope.chooseBackStep = function() {
				$location.path('/initialsetup/accountreview');
	    };

	    $scope.manualNextStep = function() {
				$location.path('/home');
	    };

	    $scope.manualBackStep = function() {
				$scope.showStep('chooseSync');
	    };

	    $scope.domainNextStep = function() {
				$scope.setDomain();
				$scope.showStep('installCloud');
	    };

	    $scope.domainBackStep = function() {
				$scope.showStep('chooseSync');
	    };

	    $scope.installNextStep = function() {
				$scope.getStatus();
				$scope.showStep('syncStatus');
	    };

	    $scope.installBackStep = function() {
				$scope.showStep('domain');
	    };

	    $scope.syncNextStep = function() {
				$location.path('/home');
	    };

	    $scope.syncBackStep = function() {
				$scope.showStep('installCloud');
	    };

	    $scope.showStep = function(thisStep) {

				//remove other pages are tab highlight from view
				for(var stepNum in allSteps) {
					var step = allSteps[stepNum];
					if(step !== thisStep) {
						$('#'+step).removeClass('ng-show');
						$('#'+step).addClass('ng-hide');
						$('#'+step+'Tab').removeClass('tabHighlight');
						
	        } else {
						$('#'+step).removeClass('ng-hide');
						$('#'+step).addClass('ng-show');
						$('#'+step+'Tab').addClass('tabHighlight');
	        }
	      }

	      if(thisStep === 'chooseSync') {
					for(var choosestepNum in allSteps) {
						var choosestep = allSteps[choosestepNum];
						$('#'+choosestep+'Tab').removeClass('ng-show');
						$('#'+choosestep+'Tab').addClass('ng-hide');
					}
					$('#chooseSyncTab').addClass('ng-show');
					$('#chooseSyncTab').removeClass('ng-hide');
				} else {
					$('#chooseSyncTab').removeClass('ng-show');
					$('#chooseSyncTab').addClass('ng-hide');
		      var syncOption = $scope.chooseSync;
		      if(syncOption === 'dirsync') {
						for(var dirstepNum in dirsyncSteps) {
							var dirstep = dirsyncSteps[dirstepNum];
							$('#'+dirstep+'Tab').addClass('ng-show');
							$('#'+dirstep+'Tab').removeClass('ng-hide');
						}
						for(var manstepNum in manualSteps) {
							var manstep = manualSteps[manstepNum];
							$('#'+manstep+'Tab').removeClass('ng-show');
							$('#'+manstep+'Tab').addClass('ng-hide');
						}
					} else if (syncOption === 'manual') {
						for(var manstepNumm in manualSteps) {
							var mannstep = manualSteps[manstepNumm];
							$('#'+mannstep+'Tab').addClass('ng-show');
							$('#'+mannstep+'Tab').removeClass('ng-hide');
						}
						for(var dirstepNumm in dirsyncSteps) {
							var dirrstep = dirsyncSteps[dirstepNumm];
							$('#'+dirrstep+'Tab').removeClass('ng-show');
							$('#'+dirrstep+'Tab').addClass('ng-hide');
						}
					}
				}
	    };

	    //*********************************************DIRSYNC*********************************************//
			$scope.getDefaultDomain = function() {
        DirSyncService.getDirSyncDomain(function(data, status) {
          if (data.success) {
            Log.debug('Retrieved DirSync domain name. Status: ' + status);
            if(data && data.domains[0]) {
              $scope.domain = data.domains[0].domainName;
              if($scope.domain.length > 0) {
                $scope.domainExists = true;
              } else {
                $scope.domainExists = false;
              }
            }
          } else {
            Log.debug('Failed to retrieve directory sync configuration. Status: ' + status);
            Notification.notify([$translate.instant('dirsyncModal.getDomainFailed', {
              status: status
            })], 'error');
          }
        });
      };

      $scope.setDomainName = function(domainName) {
        $scope.domain = domainName.value;
      };

      $scope.setDomain = function() {
        if(($scope.domain.length > 0) && ($scope.domainExists !== true)) {
          DirSyncService.postDomainName($scope.domain, function(data, status) {
            if (data.success) {
              Log.debug('Created DirSync domain. Status: ' + status);
            } else {
              Log.debug('Failed to create directory sync domain. Status: ' + status);
              Notification.notify([$translate.instant('dirsyncModal.setDomainFailed', {
                status: status
              })], 'error');
            }
          });
        }
      };

      $scope.formatDate = function(date) {
        if (date !== ''){
          return moment.utc(date).local().format('MMM D \'YY h:mm a');
        } else {
          return date;
        }
      };

      $scope.getStatus = function() {
        $scope.dirsyncStatus = '';
        $scope.numUsersInSync = 0;
        $scope.userList = [];

        DirSyncService.getDirSyncStatus(function(data, status) {
          if (data.success) {
            Log.debug('Retrieved DirSync status successfully. Status: ' + status);
            if(data) {
              $scope.dirsyncStatus = data.result;
              $scope.lastEndTime = data.lastEndTime;
            }
          } else {
            Log.debug('Failed to retrieve directory sync status. Status: ' + status);
            Notification.notify([$translate.instant('dirsyncModal.getStatusFailed', {
              status: status
            })], 'error');
          }
        });

        UserListService.listUsers(null, null, null, null, function(data, status, searchStr) {
          if (data.success) {
            Log.debug('Retrieved user list successfully. Status: ' + status);
            if(data) {
              $scope.numUsersInSync = data.totalResults;
              
              for(var i = 0; i < data.totalResults; i++) {
                var userArrObj = {
                  Email: null,
                  Name: null
                };
                userArrObj.Email = data.Resources[i].userName;
                userArrObj.Name = data.Resources[i].displayName;
                $scope.userList.push(userArrObj);
              }
            }
          } else {
            Log.debug('Failed to retrieve user list. Status: ' + status);
            Notification.notify([$translate.instant('dirsyncModal.getListFailed', {
              status: status
            })], 'error');
          }
        });
    
      };

      $scope.syncNow = function() {
        angular.element('#syncNowBtn').button('loading');
        DirSyncService.syncUsers(500, function(data, status) {
          if (data.success) {
            angular.element('#syncNowBtn').button('reset');
            Log.debug('DirSync started successfully. Status: ' + status);
            Notification.notify([$translate.instant('dirsyncModal.dirsyncSuccess', {
              status: status
            })], 'success');
          } else {
            angular.element('#syncNowBtn').button('reset');
            Log.debug('Failed to start directory sync. Status: ' + status);
            Notification.notify([$translate.instant('dirsyncModal.dirsyncFailed', {
              status: status
            })], 'error');
          }
        });
      };

      //*********************************************MANUAL ENTRY*********************************************//
      $scope.init = function () {
        setPlaceholder();
      };

      var setPlaceholder = function () {
        var placeholder = $filter('translate')('usersPage.userInput');
        angular.element('#usersfield-tokenfield').attr('placeholder', placeholder);
      };

      //Initialize
      Notification.init($scope);
      $scope.popup = Notification.popup;
      var invalidcount = 0;

      function Feature (name, state) {
        this.entitlementName = name;
        this.entitlementState = state? 'ACTIVE' : 'INACTIVE';
      }

      //email validation logic
      var validateEmail = function(input) {
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

      //placeholder logic
      var checkPlaceholder = function() {
        if (angular.element('.token-label').length > 0) {
          angular.element('#usersfield-tokenfield').attr('placeholder', '');
        } else {
          setPlaceholder();
        }
      };

      var checkButtons = function() {
        if (invalidcount > 0) {
          angular.element('#btnInvite').prop('disabled', true);
        } else {
          angular.element('#btnInvite').prop('disabled', false);
        }
      };

      //tokenfield setup - Should make it into a directive later.
      angular.element('#usersfield').tokenfield({
        delimiter: [',', ';'],
        createTokensOnBlur: true
      })
        .on('tokenfield:preparetoken', function(e) {
          //Removing anything in brackets from user data
          var value = e.token.value.replace(/\s*\([^)]*\)\s*/g, ' ');
          e.token.value = value;
        })
        .on('tokenfield:createtoken', function(e) {
          if (!validateEmail(e.token.value)) {
            angular.element(e.relatedTarget).addClass('invalid');
            invalidcount++;
          }
          checkButtons();
          checkPlaceholder();
        })
        .on('tokenfield:edittoken', function(e) {
          if (!validateEmail(e.token.value)) {
            invalidcount--;
          }
        })
        .on('tokenfield:removetoken', function(e) {
          if (!validateEmail(e.token.value)) {
            invalidcount--;
          }
          checkButtons();
          checkPlaceholder();
        });

			var getUsersList = function() {
        return $window.addressparser.parse(angular.element('#usersfield').tokenfield('getTokensList'));
      };

      var resetUsersfield = function() {
        angular.element('#usersfield').tokenfield('setTokens', ' ');
        checkPlaceholder();
        invalidcount = 0;
      };

      $scope.clearPanel = function() {
        resetUsersfield();
        $scope.results = null;
      };

      var startLog;
			$scope.inviteUsers = function() {
        var usersList = getUsersList();
        Log.debug('Invite: ', usersList);
        $scope.results = {
          resultList: []
        };
        var isComplete = true;
        var callback = function(data, status) {

          if (data.success) {
            Log.info('User invitation sent successfully.', data.id);
            // var success = [$translate.instant('usersPage.successInvite', data)];
            // Notification.notify(success, 'success');
            for (var i = 0; i < data.inviteResponse.length; i++) {

              var userResult = {
                email: data.inviteResponse[i].email,
                alertType: null
              };

              var userStatus = data.inviteResponse[i].status;

              if (userStatus === 200) {
                userResult.alertType = 'success';
              } else {
                userResult.alertType = 'danger';
                isComplete = false;
              }
              userResult.status = userStatus;
              $scope.results.resultList.push(userResult);
            }

            //concatenating the results in an array of strings for notify function
            var successes = [];
            var errors = [];
            var count_s = 0;
            var count_e = 0;
            for (var idx in $scope.results.resultList) {
              if ($scope.results.resultList[idx].status === 200) {
                successes[count_s] = $translate.instant('usersPage.emailSent', $scope.results.resultList[idx]);
                count_s++;
              } else if ($scope.results.resultList[idx].status === 304) {
                errors[count_e] = $translate.instant('usersPage.entitled', $scope.results.resultList[idx]);
                count_e++;
              } else if ($scope.results.resultList[idx].status === 403) {
                errors[count_e] = $translate.instant('usersPage.forbidden', $scope.results.resultList[idx]);
                count_e++;
              } else {
                errors[count_e] = $translate.instant('usersPage.emailFailed', $scope.results.resultList[idx]);
                count_e++;
              }
            }
            //Displaying notifications
            if (successes.length + errors.length === usersList.length)
            {
              angular.element('#btnInvite').button('reset');
              Notification.notify(successes, 'success');
              Notification.notify(errors, 'error');
            }

          } else {
            Log.error('Could not process invitation.  Status: ' + status, data);
            var error = [$translate.instant('usersPage.errInvite', data)];
            Notification.notify(error, 'error');
            isComplete = false;
            angular.element('#btnInvite').button('reset');
          }

          var msg = 'inviting ' + usersList.length + ' users...';
          LogMetricsService.logMetrics(msg, LogMetricsService.getEventType('inviteUsers'), LogMetricsService.getEventAction('buttonClick'), status, startLog, usersList.length);

          if (isComplete) {
            resetUsersfield();
          }

        };

        if (typeof usersList !== 'undefined' && usersList.length > 0) {
          angular.element('#btnInvite').button('loading');

          startLog = moment();

          var i,temparray,chunk = Config.batchSize;
          for (i=0; i<usersList.length; i+=chunk) {
            temparray = usersList.slice(i,i+chunk);
            //update entitlements
            Userservice.inviteUsers(usersList, callback);
          }
          
        } else {
          Log.debug('No users entered.');
          var error = [$filter('translate')('usersPage.validEmailInput')];
          Notification.notify(error, 'error');
        }

      };
    }
  ]);