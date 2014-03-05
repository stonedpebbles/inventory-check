'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('LogoutCtrl', ['$scope', '$window', 'Storage', 'Config', 'Log', 'Authinfo',
    function($scope, $window, Storage, Config, Log, Authinfo) {

      if (Storage.get('accessToken')) {
        $scope.loggedIn = true;
      } else {
        $scope.loggedIn = false;
      }

      //Set logout redirect depending on environment
      var logoutUrl = document.URL.indexOf('127.0.0.1') !== -1 || document.URL.indexOf('localhost') !== -1 ? Config.logoutUrl + encodeURIComponent('127.0.0.1:8000') : Config.logoutUrl + encodeURIComponent(Config.adminClientUrl);

      $scope.logout = function() {
        Storage.clear();
        $scope.loggedIn = false;
        Log.debug('Redirected to logout url.');
        $window.location.href = logoutUrl;
      };

      //Set Authinfo scope variables
      console.log(Authinfo.getUserName());
    }

  ]);
