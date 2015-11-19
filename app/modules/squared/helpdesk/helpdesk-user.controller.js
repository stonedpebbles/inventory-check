(function() {
  'use strict';

  /* @ngInject */
  function HelpdeskUserController($stateParams, HelpdeskService, XhrNotificationService) {
    var vm = this;
    var userId = $stateParams.user.id;
    var orgId = $stateParams.user.organization.id;

    vm.user = $stateParams.user;
    vm.showCard = showCard;

    HelpdeskService.getUser(orgId, userId).then(function(res) {
      vm.user = res;
    }, function(err) {
      XhrNotificationService.notify(err);
    });

    HelpdeskService.getOrg(orgId).then(function(res) {
      vm.org = res;
    }, function(err) {
      XhrNotificationService.notify(err);
    });

    function showCard(type) {
      var entitlements = vm.user.entitlements;
      switch (type) {
        // cloudmeetings
        case 'message':
          return _.includes(entitlements, "webex-squared");
        case 'meeting':
          return _.includes(entitlements, "webex-squared");
        case 'call':
          return _.includes(entitlements, "squared-call-initiation");
        case 'hybrid':
          return _.includes(entitlements, "squared-fusion-cal") || _.includes(entitlements, "squared-fusion-uc");

      }
      //TODO: Include test of user entitlemnts
      return true;
    }

  }

  angular
    .module('Squared')
    .controller('HelpdeskUserController', HelpdeskUserController);
}());
