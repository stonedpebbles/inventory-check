(function () {
  'use strict';

  angular.module('Core')
    .service('FeatureToggleService', FeatureToggleService);

  /* @ngInject */
  function FeatureToggleService($http, $q, Config, Authinfo, Orgservice) {
    var features = {
      pstnSetup: 'pstnSetup',
      csvUpload: 'csvUpload',
      dirSync: 'dirSync'
    };
    var service = {
      getFeaturesForUser: getFeaturesForUser,
      supports: supports,
      supportsPstnSetup: supportsPstnSetup,
      supportsCsvUpload: supportsCsvUpload,
      supportsDirSync: supportsDirSync
    };

    return service;

    function getFeaturesForUser(uid, feature) {
      if (!uid || !feature) {
        return $q(function (resolve, reject) {
          reject((!uid ? 'uid' : 'feature') + ' is undefined');
        });
      }

      var server = Config.getFeatureToggleUrl();
      var featureToggleURL = server + '/locus/api/v1/features/users/' + uid;

      return $http.get(featureToggleURL, {
        cache: true
      }).then(function (data, status) {
        var contained = false;
        _.each(data.data.developer, function (element) {
          if (element.key === feature && element.val === 'true') {
            contained = true;
          }
        });
        return contained;
      });
    }

    function supports(feature) {
      return $q(function (resolve, reject) {
        //TODO temporary hardcoded checks for huron
        if (feature === features.pstnSetup) {
          return resolve(Authinfo.getOrgId() === '666a7b2f-f82e-4582-9672-7f22829e728d');
        } else if (feature === features.csvUpload) {
          return resolve(true);
        } else if (feature === features.dirSync) {
          supportsDirSync().then(function (enabled) {
            return resolve(enabled && Authinfo.getOrgId() === '4e2befa3-9d82-4fdf-ad31-bb862133f078');
          });
        }
        // else {
        //TODO first check user features
        //TODO then check org features
        //TODO last check system features
        // }
      });
    }

    //TODO temporary
    function supportsPstnSetup() {
      return supports(features.pstnSetup);
    }

    function supportsCsvUpload() {
      return supports(features.csvUpload);
    }

    function supportsDirSync() {
      var deferred = $q.defer();
      Orgservice.getOrgCacheOption(function (data, status) {
        if (data.success) {
          deferred.resolve(data.dirsyncEnabled);
        } else {
          deferred.reject(status);
        }
      }, null, {
        cache: true
      });
      return deferred.promise;
    }
  }
})();