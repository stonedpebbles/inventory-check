(function () {
  'use strict';

  angular
    .module('uc.overview')
    .controller('TelephonyOverviewCtrl', TelephonyOverviewCtrl);

  /* @ngInject */
  function TelephonyOverviewCtrl($stateParams, TelephonyInfoService) {
    /*jshint validthis: true */
    var vm = this;
    vm.currentUser = $stateParams.currentUser;

    function activate() {
      // TODO: Change TelephonyInfoService to return directly from this instead of having
      // to call into service twice.
      TelephonyInfoService.getTelephonyUserInfo(vm.currentUser.id);
      TelephonyInfoService.getUserDnInfo(vm.currentUser.id);
      TelephonyInfoService.getRemoteDestinationInfo(vm.currentUser.id);
      TelephonyInfoService.loadInternalNumberPool();
      TelephonyInfoService.loadExternalNumberPool();
      vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
    }

    activate();

  }
})();
