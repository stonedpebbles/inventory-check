(function () {
  'use strict';

  angular
    .module('Core')
    .controller('MessagingSetupCtrl', MessagingSetupCtrl);

  /* @ngInject */
  function MessagingSetupCtrl($log, $scope, AccountOrgService, Authinfo, Notification) {
    /*jshint validthis: true */
    var vm = this;
    var msgIntFlag = false;
    var CurrentDataRetentionPeriod = null;
    vm.msgIntegration = false;
    vm.dataShare = true;
    vm.placeholder = 'Select retention time';
    vm.selected = {
      label: '',
      value: ''
    };
    vm.options = [{
      label: 'Delete immediately',
      value: 'immediate'
    }, {
      label: '30 days',
      value: '30'
    }, {
      label: '60 days',
      value: '60'
    }, {
      label: '90 days',
      value: '90'
    }, {
      label: 'Keep forever',
      value: 'indefinite'
    }];

    var orgId = Authinfo.getOrgId();
    AccountOrgService.getServices(orgId, null, function (data, status) {
      if (status === 200) {
        var interopIndex = _.findIndex(data.entitlements, function (obj) {
          return obj.serviceId == 'messengerInterop';
        });
        if (interopIndex > -1) {
          vm.msgIntegration = true;
          msgIntFlag = true;
        }
      }
    });

    AccountOrgService.getOrgSettings(orgId, function (data, status) {
      if (status === 200) {
        var dataRetentionIndex = _.findIndex(data.settings, function (obj) {
          return obj.key == 'dataRetentionPeriodDays';
        });
        if (dataRetentionIndex > -1) {
          var selectedIndex = _.findIndex(vm.options, function (obj) {
            return obj.value == data.settings[dataRetentionIndex].value;
          });
          vm.selected = vm.options[selectedIndex];
          CurrentDataRetentionPeriod = data.settings[dataRetentionIndex].value;
        }
      }
    });

    $scope.$on('wizard-messenger-setup-event', function () {

      if (!_.isEmpty(vm.selected.value) && !CurrentDataRetentionPeriod) {
        AccountOrgService.addOrgDataRetentionPeriodDays(orgId, vm.selected.value, function (data, status) {
          if (status === 204) {
            Notification.notify(['Successfully added retention period setting.'], 'success');
          } else {
            Notification.notify(['Failed to add retention period setting.'], 'error');
          }
        });
      }

      if (!_.isEmpty(vm.selected.value) && CurrentDataRetentionPeriod && CurrentDataRetentionPeriod !== vm.selected.value) {
        AccountOrgService.modifyOrgDataRetentionPeriodDays(orgId, vm.selected.value, function (data, status) {
          if (status === 200) {
            Notification.notify(['Successfully changed retention period setting.'], 'success');
          } else {
            Notification.notify(['Failed to change retention period setting.'], 'error');
          }
        });
      }

      if (vm.msgIntegration === true && msgIntFlag === false) {

        AccountOrgService.addMessengerInterop(orgId, function (data, status) {
          if (status === 204) {
            Notification.notify(['Successfully enabled Webex Messenger Integration.'], 'success');
          } else {
            Notification.notify(['Failed to enable Webex Messenger Integration.'], 'error');
          }
        });

      } else if (vm.msgIntegration === false && msgIntFlag === true) {

        AccountOrgService.deleteMessengerInterop(orgId, function (data, status) {
          if (status === 204) {
            Notification.notify(['Successfully disabled Webex Messenger Integration.'], 'success');
          } else {
            Notification.notify(['Failed to disable Webex Messenger Integration.'], 'error');
          }
        });
      }

    });

  }
})();