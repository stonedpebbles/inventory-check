(function () {
  'use strict';

  angular
    .module('uc.overview')
    .controller('TelephonyOverviewCtrl', TelephonyOverviewCtrl);

  /* @ngInject */
  function TelephonyOverviewCtrl($state, $stateParams, TelephonyInfoService) {
    var vm = this;
    vm.currentUser = $stateParams.currentUser;
    vm.actionList = [{
      actionKey: 'usersPreview.addNewLinePreview',
      actionFunction: addNewLine,
    }];
    vm.reachedMaxLines = false;

    init();

    function addNewLine() {
      $state.go('user-overview.communication.directorynumber', {
        directoryNumber: 'new'
      });
    }

    vm.reachedMaxLines = function () {
      return _.get(vm.telephonyInfo, 'directoryNumbers.length', 0) >= 25;
    };

    function init() {
      // TODO: Change TelephonyInfoService to return directly from this instead of having
      // to call into service twice.
      TelephonyInfoService.resetTelephonyInfo();
      TelephonyInfoService.getTelephonyUserInfo(vm.currentUser.id);
      TelephonyInfoService.getPrimarySiteInfo()
        .then(TelephonyInfoService.getUserDnInfo(vm.currentUser.id))
        .then(TelephonyInfoService.checkCustomerVoicemail());
      TelephonyInfoService.getRemoteDestinationInfo(vm.currentUser.id);
      TelephonyInfoService.loadInternalNumberPool();
      TelephonyInfoService.loadExternalNumberPool();
      TelephonyInfoService.getInternationalDialing(vm.currentUser.id);
      vm.telephonyInfo = TelephonyInfoService.getTelephonyInfoObject();
    }
  }
})();
