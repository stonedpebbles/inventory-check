(function () {
  'use strict';

  angular
    .module('GSS')
    .service('ComponentsService', ComponentsService);

  /* @ngInject */
  function ComponentsService($http, UrlConfig) {
    var baseUrl = UrlConfig.getGssUrl();

    var service = {
      getComponents: getComponents,
      getGroupComponents: getGroupComponents,
      addComponent: addComponent,
      delComponent: delComponent,
      modifyComponent: modifyComponent
    };

    return service;

    function extractData(response) {
      return response.data;
    }

    function getComponents(serviceId) {
      var url = baseUrl + '/services/' + serviceId + '/components';

      return $http.get(url)
        .then(extractData);
    }

    function getGroupComponents(serviceId) {
      var url = baseUrl + '/services/' + serviceId + '/components/groups';

      return $http.get(url)
        .then(extractData);
    }

    function addComponent(serviceId, component) {
      var url = baseUrl + '/services/' + serviceId + '/components';

      return $http.post(url, component)
        .then(extractData);
    }

    function delComponent(component) {
      var url = baseUrl + '/components/' + component.componentId;

      return $http.delete(url)
        .then(extractData);
    }

    function modifyComponent(component) {
      var url = baseUrl + '/components/' + component.componentId;

      return $http.put(url, component)
        .then(extractData);
    }
  }
}());
