'use strict';

angular.module('Core')
  .controller('LoginCtrl', ['$scope', '$rootScope', '$filter', '$location', '$window', '$http', 'Storage', 'SessionStorage', 'Config', 'Utils', 'Auth', 'Authinfo', 'PageParam', '$state', '$timeout', '$stateParams',
    function ($scope, $rootScope, $filter, $location, $window, $http, Storage, SessionStorage, Config, Utils, Auth, Authinfo, PageParam, $state, $timeout, $stateParams) {

      var loadingDelay = 2000;
      var logoutDelay = 5000;
      var storedState = 'storedState';
      var storedParams = 'storedParams';

      $rootScope.token = Storage.get('accessToken');

      $scope.isSpark = function () {
        return Config.getEnv() === 'sparkprod' || Config.getEnv() === 'sparkint';
      };

      var pageParam = $location.search().pp;
      if (pageParam) {
        PageParam.set(pageParam);
      }

      if ($stateParams.customerOrgId && $stateParams.customerOrgName) {
        SessionStorage.put('customerOrgName', $stateParams.customerOrgName);
        SessionStorage.put('customerOrgId', $stateParams.customerOrgId);
      } else if ($stateParams.partnerOrgId && $stateParams.partnerOrgName) {
        SessionStorage.put('partnerOrgName', $stateParams.partnerOrgName);
        SessionStorage.put('partnerOrgId', $stateParams.partnerOrgId);
      }

      var authorizeUser = function () {
        $scope.loading = true;
        $scope.loginText = 'loginPage.loading';
        if ($scope.isSpark()) {
          angular.element('html').css('background', 'url(images/bg_3515.jpg) no-repeat center center fixed');
        } else {
          angular.element('html').css('background', 'url(images/bg_1920.jpg) no-repeat center center fixed');
        }
        Auth.authorize($rootScope.token)
          .then(function () {
            if (!Authinfo.isSetupDone() && Authinfo.isCustomerAdmin()) {
              $state.go('firsttimewizard');
            } else {
              var state = 'overview';
              var params;
              if (PageParam.getRoute()) {
                state = PageParam.getRoute();
              } else if (SessionStorage.get(storedState)) {
                state = SessionStorage.pop(storedState);
                params = SessionStorage.popObject(storedParams);
              } else if (Authinfo.getRoles().indexOf('PARTNER_ADMIN') > -1) {
                state = 'partneroverview';
              }
              $rootScope.services = Authinfo.getServices();

              $timeout(function () {
                angular.element('html').css('background', 'none');
                $state.go(state, params);
              }, loadingDelay);
            }
          }).catch(function (error) {
            if (error) {
              $timeout(function () {
                $scope.result = error;
                $timeout(Auth.logout, logoutDelay);
              }, loadingDelay);
            } else {
              $timeout(Auth.logout, logoutDelay);
            }
          });
      };

      $scope.$on('ACCESS_TOKEN_RETRIEVED', function () {
        authorizeUser();
      });

      if ($rootScope.token) {
        authorizeUser();
      }

      $scope.login = function () {
        Auth.redirectToLogin();
      };

      //Branding dependent changes. To be removed later.
      $scope.loginText = 'loginPage.login';

      if ($scope.isSpark()) {
        angular.element('html').css('background', 'url(images/bg_3515.jpg) no-repeat center center fixed');
      }

    }
  ]);
