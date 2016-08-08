(function () {
  'use strict';

  /* @ngInject  */
  function CsdmCodeService($http, Authinfo, CsdmConfigService, CsdmConverter, CsdmCacheFactory) {

    var codesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/codes';

    var codeCache = CsdmCacheFactory.create({
      remove: $http.delete,
      update: function (url, obj) {
        return $http.patch(url, obj).then(function () {
          // todo: hackorama - API is fubar
          var code = _.clone(codeCache.list()[url]);
          if (obj.description) {
            try {
              code.tags = JSON.parse(obj.description);
            } catch (e) {
              code.tags = [];
            }
          }
          if (obj.name) {
            code.displayName = obj.name;
          }
          return code;
        });
      },
      fetch: function () {
        return $http.get(codesUrl).then(function (res) {
          return CsdmConverter.convertCodes(res.data);
        });
      },
      create: function (url, obj) {
        return $http.post(url, obj).then(function (res) {
          return CsdmConverter.convertCode(res.data);
        });
      }
    });

    function getCodeList() {
      return codeCache.list();
    }

    function updateCodeName(deviceUrl, name) {
      return codeCache.update(deviceUrl, {
        name: name
      });
    }

    function updateTags(url, tags) {
      codeCache.list()[url].tags = tags; // update ui asap
      codeCache.list()[url].tagString = tags.join(', '); // update ui asap
      return codeCache.update(url, {
        description: JSON.stringify(tags || [])
      });
    }

    function deleteCode(code) {
      return codeCache.remove(code.url);
    }

    function createCode(name) {
      return codeCache.create(codesUrl, {
        name: name
      });
    }

    function createCodeForExisting(cisUuid) {
      return codeCache.create(codesUrl, {
        cisUuid: cisUuid
      });
    }

    return {
      on: codeCache.on,
      updateTags: updateTags,
      deleteCode: deleteCode,
      createCode: createCode,
      createCodeForExisting: createCodeForExisting,
      getCodeList: getCodeList,
      updateCodeName: updateCodeName
    };
  }

  angular
    .module('Squared')
    .service('CsdmCodeService', CsdmCodeService);

})();
