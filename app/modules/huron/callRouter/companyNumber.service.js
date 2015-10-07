(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('RouterCompanyNumber', RouterCompanyNumber);

  /* @ngInject */
  function RouterCompanyNumber($q, Log, Notification, ServiceSetup, CallRouterService, UserServiceCommon, Authinfo) {
    function loadExternalNumberPool(pattern) {
      var deferred = $q.defer();
      ServiceSetup.loadExternalNumberPool(pattern).then(function () {

        var externalNumberPool = ServiceSetup.externalNumberPool,
          numbers = [];

        if (angular.isDefined(pattern) && angular.isObject(pattern)) {
          deferred.resolve(externalNumberPool);
        } else {
          angular.forEach(externalNumberPool, function (value, key) {
            numbers.push(value.pattern);
            if (key === externalNumberPool.length - 1) {
              var data = {};
              data.numbers = numbers;
              data.externalNumberPool = externalNumberPool;
              deferred.resolve(data);
            }
          });
        }
      }).catch(function (response) {
        var externalNumberPool = [];
        Notification.errorResponse(response, 'directoryNumberPanel.externalNumberPoolError');
      });
      return deferred.promise;
    }

    function listCompanyNumbers() {
      return CallRouterService.query({
        customerId: Authinfo.getOrgId()
      }).$promise;
    }

    function saveCompanyNumber(data) {
      return CallRouterService.save({
        customerId: Authinfo.getOrgId()
      }, data).$promise;
    }

    function updateCompanyNumber(data, companyNumberId) {
      return CallRouterService.update({
        customerId: Authinfo.getOrgId(),
        companyNumberId: companyNumberId
      }, data).$promise;
    }

    function deleteCompanyNumber(data, companyNumberId) {
      return CallRouterService.delete({
        customerId: Authinfo.getOrgId(),
        companyNumberId: companyNumberId
      }, data).$promise;
    }

    return {
      loadExternalNumberPool: loadExternalNumberPool,
      listCompanyNumbers: listCompanyNumbers,
      saveCompanyNumber: saveCompanyNumber,
      updateCompanyNumber: updateCompanyNumber,
      deleteCompanyNumber: deleteCompanyNumber
    };
  }

})();