'use strict';

//Defining a FaultRuleService.
angular.module('Mediafusion')
  .service('FaultRuleService', ['$http', '$rootScope', 'Config', 'Authinfo', 'Log', 'Utils', 'Auth',
    function ($http, $rootScope, Config, Authinfo, Log, Utils, Auth) {

      //Fetching the Base url form config.js file.
      var baseUrl = Config.getFaultServiceUrl();

      var listFaultServices = {

        listSystemTypes: function (callback) {

          var sysTypesListUrl = Utils.sprintf(baseUrl + '/threshold/allSystemTypes', [Authinfo.getOrgId()]);
          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

          $http.get(sysTypesListUrl)
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

        listSystems: function (systemType, callback) {

          var queryParams = "?type=" + systemType;

          var sysNamesListUrl = Utils.sprintf(baseUrl + '/threshold/system', [Authinfo.getOrgId()]);
          sysNamesListUrl = sysNamesListUrl + queryParams;

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

          $http.get(sysNamesListUrl)
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

        listMetricTypes: function (systemName, callback) {

          var queryParams = "?system=" + systemName;

          var metricTypesListUrl = Utils.sprintf(baseUrl + '/threshold/metricType', [Authinfo.getOrgId()]);
          metricTypesListUrl = metricTypesListUrl + queryParams;

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

          $http.get(metricTypesListUrl)
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

        listMetricCounters: function (systemName, metricType, callback) {

          var queryParams = "?system=" + systemName + "&metricType=" + metricType;

          var metricCountersListUrl = Utils.sprintf(baseUrl + '/threshold/metricCounter', [Authinfo.getOrgId()]);
          metricCountersListUrl = metricCountersListUrl + queryParams;

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

          $http.get(metricCountersListUrl)
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

        addThreshold: function (threshold, callback) {

          var addThresholdUrl = Utils.sprintf(baseUrl + '/threshold/add', [Authinfo.getOrgId()]);
          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

          $http.post(addThresholdUrl, threshold)
            .success(function (data, status) {
              //data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              //data.success = false;
              //data.status = status;

              callback(data, status);
              Auth.handleStatus(status);
            });
        }

      };

      return listFaultServices;

    }
  ]);