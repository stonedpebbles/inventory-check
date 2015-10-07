(function () {
  'use strict';

  /*ngInject*/
  function USSService2($http, ConfigService, Authinfo) {
    var statusesParameterRequestString = function (serviceId, state, limit) {
      var statefilter = state ? "&state=" + state : "";
      return 'serviceId=' + serviceId + statefilter + '&limit=' + limit + '&orgId=' + Authinfo.getOrgId();
    };

    function extractData(res) {
      return res.data;
    }

    function decorateWithStatus(status) {
      if (!status) {
        return 'unknown';
      }
      if (!status.entitled) {
        return 'not_entitled';
      }
      switch (status.state) {
      case 'error':
        return 'error';
      case 'deactivated':
      case 'notActivated':
        return 'pending_activation';
      case 'activated':
        return 'activated';
      default:
        return 'unknown';
      }
    }

    function getStatusesForUser(userId) {
      return $http
        .get(ConfigService.getUSSUrl() + '/userStatuses?userId=' + userId + '&orgId=' + Authinfo.getOrgId())
        .then(function (res) {
          return _.filter(res.data.userStatuses, function (nugget) {
            return nugget.entitled || (nugget.entitled === false && nugget.state != "deactivated");
          });
        });
    }

    function getOrg(orgId) {
      return $http
        .get(ConfigService.getUSSUrl() + '/orgs/' + orgId)
        .then(extractData);
    }

    function updateOrg(org) {
      return $http
        .patch(ConfigService.getUSSUrl() + '/orgs/' + org.id, org)
        .then(extractData);
    }

    function getStatusesSummary() {
      return $http
        .get(ConfigService.getUSSUrl() + '/userStatuses/summary?orgId=' + Authinfo.getOrgId())
        .then(function (res) {
          return res.data.summary;
        });
    }

    function getStatuses(serviceId, state, limit) {
      return $http
        .get(ConfigService.getUSSUrl() + '/userStatuses?' + statusesParameterRequestString(serviceId, state, limit));
    }
    return {
      getStatusesForUser: getStatusesForUser,
      decorateWithStatus: decorateWithStatus,
      getOrg: getOrg,
      updateOrg: updateOrg,
      getStatusesSummary: getStatusesSummary,
      getStatuses: getStatuses
    };
  }

  angular.module('Hercules')
    .service('USSService2', USSService2);
}());