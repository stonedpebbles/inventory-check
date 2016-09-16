(function () {
  'use strict';

  angular.module('uc.autoattendant')
    .controller('AAMediaUploadCtrl', AAMediaUploadCtrl);

  /* @ngInject */
  function AAMediaUploadCtrl($scope, AANotificationService, AACommonService, AAMediaUploadService, AAUiModelService) {
    var vm = this;

    vm.uploadFile = '';
    vm.uploadDate = '';
    vm.WAIT = "WAIT";
    vm.DOWNLOAD = "DOWNLOAD";
    vm.UPLOADED = "UPLOADED";
    vm.state = vm.WAIT;
    vm.menuEntry = {};
    vm.wavFile = '';

    var saveOn = 'uploadingInProgress';
    var actionName = 'play';

    vm.upload = upload;

    //////////////////////////////////////////////////////

    function upload(file) {
      if (angular.isDefined(file)) {
        if (AAMediaUploadService.validateFile(file.name)) {
          AACommonService.setIsValid(saveOn, false);
          vm.state = vm.DOWNLOAD;
          vm.uploadFile = file.name;
          vm.uploadDate = moment().format("MM/DD/YYYY");
          vm.progress = 10;
          AAMediaUploadService.upload(file)
            .then(uploadSuccess, uploadError, uploadProgress)
            .finally(cleanUp);
        } else {
          AANotificationService.error('fileUpload.errorFileType');
        }
      }
    }

    function cleanUp() {
      AACommonService.setIsValid(saveOn, true);
      AACommonService.setMediaUploadStatus(true);
    }

    function uploadSuccess(result) {
      var action = getPlayAction(vm.menuEntry);
      var fd = {};
      fd.uploadFile = vm.uploadFile;
      fd.uploadDate = vm.uploadDate;
      action.setDescription(JSON.stringify(fd));
      action.setValue('http://' + result.data.PlaybackUri);
      vm.state = vm.UPLOADED;
    }

    function uploadError() {
      vm.state = vm.WAIT;
      vm.progress = 0;
      vm.uploadFile = '';
      vm.uploadDate = '';
      AANotificationService.error('autoAttendant.uploadFailed');
    }

    function uploadProgress(evt) {
      vm.progress = parseInt((100.0 * (evt.loaded / evt.total)), 10);
    }

    function getPlayAction(menuEntry) {
      var playAction;
      if (menuEntry && menuEntry.actions && menuEntry.actions.length > 0) {
        playAction = _.find(menuEntry.actions, function (action) {
          return action.getName() === actionName;
        });
        return playAction;
      }
    }

    function populateUiModel() {
      var ui = AAUiModelService.getUiModel();
      var uiMenu = ui[$scope.schedule];
      vm.menuEntry = uiMenu.entries[$scope.index];
      var playAction = getPlayAction(vm.menuEntry);
      if (angular.isDefined(playAction)) {
        if (!_.isEmpty(playAction.getValue())) {
          try {
            var desc = JSON.parse(playAction.getDescription());
            vm.uploadFile = desc.uploadFile;
            vm.uploadDate = desc.uploadDate;
            vm.state = vm.UPLOADED;
          } catch (exception) {
            playAction.setValue('');
            playAction.setDescription('');
          }
        }
      }
    }


    function activate() {
      populateUiModel();
    }

    activate();

  }

})();
