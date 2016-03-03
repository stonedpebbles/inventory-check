(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderContainerCtrl', AABuilderContainerCtrl);

  /* @ngInject */
  function AABuilderContainerCtrl($stateParams, $modal, AutoAttendantCeInfoModelService,
    AutoAttendantCeMenuModelService, AutoAttendantCeService, AAUiModelService, AAModelService, Config) {

    var vm = this;
    vm.aaModel = {};
    vm.ui = {};

    vm.getScheduleTitle = getScheduleTitle;
    vm.openScheduleModal = openScheduleModal;
    vm.isScheduleAvailable = isScheduleAvailable;

    function isScheduleAvailable() {
      return (Config.isDev() || Config.isIntegration());
    }

    function openScheduleModal() {
      var modalInstance = $modal.open({
        templateUrl: 'modules/huron/features/autoAttendant/schedule/aaScheduleModal.tpl.html',
        controller: 'AAScheduleModalCtrl',
        controllerAs: 'aaScheduleModalCtrl'
      });

      modalInstance.result.then(function (result) {
        // Put anything needed after the modal is finished here
      });
    }
    /////////////////////

    function getScheduleTitle() {
      if (!vm.ui.isClosedHours && !vm.ui.isHolidays) {
        return "autoAttendant.scheduleAllDay";
      }

      return "autoAttendant.schedule";
    }

    function activate() {
      vm.aaModel = AAModelService.getAAModel();
      vm.ui = AAUiModelService.getUiModel();
      if (vm.aaModel.aaRecord.scheduleId) {
        vm.ui.isClosedHours = true;
      } else {
        vm.ui.isClosedHours = false;
      }
    }

    activate();
  }
})();
