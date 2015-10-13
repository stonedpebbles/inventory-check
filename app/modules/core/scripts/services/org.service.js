(function () {
  'use strict';

  /* global lodash */

  angular
    .module('Core')
    .factory('Orgservice', Orgservice);

  /* @ngInject */
  function Orgservice($http, $location, $q, $rootScope, Auth, Authinfo, Config, Log, Storage) {
    var service = {
      'getOrg': getOrg,
      'getAdminOrg': getAdminOrg,
      'getValidLicenses': getValidLicenses,
      'getUnlicensedUsers': getUnlicensedUsers,
      'setSetupDone': setSetupDone,
      'setOrgSettings': setOrgSettings,
      'createOrg': createOrg,
      'listOrgs': listOrgs,
      'getOrgCacheOption': getOrgCacheOption
    };

    return service;

    ////////////////

    function getOrg(callback, oid, disableCache) {
      var scomUrl = null;
      if (oid) {
        scomUrl = Config.getScomUrl() + '/' + oid;
      } else {
        scomUrl = Config.getScomUrl() + '/' + Authinfo.getOrgId();
      }

      if (disableCache) {
        scomUrl = scomUrl + '?disableCache=true';
      }

      $http.get(scomUrl)
        .success(function (data, status) {
          data = data || {};
          data.success = true;

          if (_.isEmpty(data.orgSettings)) {
            data.orgSettings = {};
            Log.debug('No orgSettings found for org: ' + data.id);
          } else {
            data.orgSettings = JSON.parse(_.last(data.orgSettings));
          }

          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }

    function getAdminOrg(callback, oid) {
      var adminUrl = null;
      if (oid) {
        adminUrl = Config.getAdminServiceUrl() + 'organizations/' + oid;
      } else {
        adminUrl = Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId();
      }

      $http.get(adminUrl)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }

    /**
     * Compare the two lists of licenses and filter out invalid ones
     */
    function getValidLicenses() {
      var d = $q.defer();

      getAdminOrg(function (data, status) {
        var validLicenses;
        var usageLicenses = data.licenses || [];
        var statusLicenses = Authinfo.getLicenses();

        if (!data.success) {
          Log.debug('Get existing admin org failed. Status: ' + status);
          d.reject(status);
          return;
        }

        validLicenses = _.filter(usageLicenses, function (license) {
          var match = _.find(statusLicenses, {
            'licenseId': license.licenseId
          });
          // If the license is not valid do not add to list
          return !(match.status === 'CANCELLED' || match.status === 'SUSPENDED');
        });

        d.resolve(validLicenses);
      });

      return d.promise;
    }

    function getUnlicensedUsers(callback, oid) {
      var adminUrl = null;
      if (oid) {
        adminUrl = Config.getAdminServiceUrl() + 'organizations/' + oid + "/unlicensedUsers";
      } else {
        adminUrl = Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + "/unlicensedUsers";
      }

      $http.get(adminUrl)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }

    function setSetupDone() {
      var adminUrl = Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/setup';

      return $http({
        method: 'PATCH',
        url: adminUrl
      });
    }

    /**
     * Get the latest orgSettings, merge with new settings, and PATCH the org
     */
    function setOrgSettings(orgId, settings, callback) {
      var orgUrl = Config.getAdminServiceUrl() + 'organizations/' + orgId + '/settings';

      getOrg(function (orgData, orgStatus) {
        var orgSettings = orgData.orgSettings;
        _.assign(orgSettings, settings);

        $http({
            method: 'PATCH',
            url: orgUrl,
            data: orgSettings
          })
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            Log.debug('PATCHed orgSettings: ' + orgSettings);
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
          });
      }, orgId, true);
    }

    function createOrg(enc, callback) {
      var orgUrl = Config.getAdminServiceUrl() + 'organizations';
      var orgRequest = {
        'encryptedQueryString': enc
      };

      Auth.setAccessToken().then(function () {
        $http.post(orgUrl, orgRequest)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
          });
      });
    }

    function listOrgs(filter, callback) {
      if (!filter || filter.length <= 3) {
        callback('error', 100);
        return;
      }
      var orgUrl = Config.getProdAdminServiceUrl() + 'organizationstemp?displayName=' + filter;

      $http.get(orgUrl)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }

    function getOrgCacheOption(callback, oid, config) {
      var scomUrl = null;
      if (oid) {
        scomUrl = Config.getScomUrl() + '/' + oid;
      } else {
        scomUrl = Config.getScomUrl() + '/' + Authinfo.getOrgId();
      }

      if (!config) {
        config = {};
      }

      $http.get(scomUrl, config)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }
  }
})();