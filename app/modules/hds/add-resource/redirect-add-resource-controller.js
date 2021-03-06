(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSRedirectAddResourceController', HDSRedirectAddResourceController);

  /* @ngInject */
  function HDSRedirectAddResourceController($modal, $modalInstance, $state, $translate, $window, HDSAddResourceCommonService, Notification, firstTimeSetup, proceedSetup) {
    var vm = this;
    vm.clusterList = [];
    vm.selectPlaceholder = $translate.instant('hds.add-resource-dialog.cluster');
    vm.redirectToTargetAndCloseWindowClicked = redirectToTargetAndCloseWindowClicked;
    vm.next = next;
    vm.enableRedirectToTarget = false;
    vm.selectedCluster = '';
    vm.selectedClusterId = '';
    vm.firstTimeSetup = firstTimeSetup;
    vm.closeSetupModal = closeSetupModal;
    vm.radio = 1;
    vm.noProceed = false;
    vm.proceedSetup = proceedSetup;
    vm.canGoNext = canGoNext;

    HDSAddResourceCommonService.updateClusterLists().then(function (clusterList) {
      vm.clusterList = clusterList;
    })
    .catch(function (error) {
      Notification.errorWithTrackingId(error, 'hds.genericError');
    });

    function redirectToTargetAndCloseWindowClicked(hostName, enteredCluster) {
      $modalInstance.close();
      HDSAddResourceCommonService.addRedirectTargetClicked(hostName, enteredCluster).then(function () {
        HDSAddResourceCommonService.redirectPopUpAndClose(hostName, enteredCluster, vm.selectedClusterId, vm.firstTimeSetup);
      });
    }

    function closeSetupModal(isCloseOk) {
      if (!vm.firstTimeSetup) {
        $modalInstance.close();
        return;
      }
      if (isCloseOk) {
        $modalInstance.close();
        $state.go('services-overview');
        return;
      }
      $modal.open({
        templateUrl: 'modules/hds/add-resource/confirm-setup-cancel-dialog.html',
        type: 'dialog'
      })
        .result.then(function () {
          $modalInstance.close();
          $state.go('services-overview');
        });
    }


    function next() {
      if (vm.radio === 0) {
        vm.noProceed = true;
        //TODO: Switch to HDS link when available
        $window.open('https://7f3b835a2983943a12b7-f3ec652549fc8fa11516a139bfb29b79.ssl.cf5.rackcdn.com/Media-Fusion-Management-Connector/mfusion.ova');
      } else if (vm.proceedSetup) {
        if (!_.isUndefined(vm.selectedCluster) && vm.selectedCluster !== '' && !_.isUndefined(vm.hostName)) {
          vm.enableRedirectToTarget = true;
        }
      } else {
        vm.proceedSetup = true;
      }
    }

    function canGoNext() {
      if (vm.firstTimeSetup && !vm.proceedSetup) {
        return true;
      } else if (vm.proceedSetup && !_.isUndefined(vm.hostName) && vm.hostName !== '' && !_.isUndefined(vm.selectedCluster) && vm.selectedCluster !== '') {
        return true;
      } else {
        return false;
      }
    }
  }
}());
