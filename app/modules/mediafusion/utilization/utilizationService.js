'use strict';

//Defining a utilizationService.
angular.module('Mediafusion')
  .service('utilizationService', ['$http', '$rootScope', 'Config', 'Authinfo', 'Log', 'Utils', 'Auth',
    function ($http, $rootScope, Config, Authinfo, Log, Utils, Auth) {

      //Fetching the Base url form config.js file.
      var searchfilter = 'filter=%s';
      var baseUrl = Config.getUtilizationServiceUrl();

      var utilizationservice = {

        //overallUtilization will actually perform a rest call and fetches the data from the server and return back to controller.

        overallUtilization: function (callback) {

          var overallUtilizationUrl = Utils.sprintf(baseUrl + '/utilization/overAllUtilization');

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

          //Actual rest call to get OverallUtilization info from server and also error case is handeled.
          $http.get(overallUtilizationUrl)
            .success(function (data, status) {
              data.success = true;
              data.status = status;
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
              var description = null;
              var errors = data.Errors;
              if (errors) {
                description = errors[0].description;
              }
              Auth.handleStatus(status, description);
            });
        },

        //realtime bridge utilization

        realTimeBridgeUtilization: function (callback) {

          console.log("inside realTimeBridgeUtilization of utilizationservice");
          var realTimeBridgeUtilizationUrl = Utils.sprintf(baseUrl + '/utilization/realTimeUtilization');

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

          //Actual rest call to get realTimeBridgeUtilizationUrl info from server and also error case is handeled.
          $http.get(realTimeBridgeUtilizationUrl)
            .success(function (data, status) {
              data.success = true;
              data.status = status;
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
              var description = null;
              var errors = data.Errors;
              if (errors) {
                description = errors[0].description;
              }
              Auth.handleStatus(status, description);
            });
        },

      };

      return utilizationservice;

    }
  ]);