(function () {
  'use strict';

  angular.module('core.trial')
    .directive('crTrialNoticeBanner', crTrialNoticeBanner);

  /* @ngInject */
  function crTrialNoticeBanner() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/core/trials/trialNoticeBanner.tpl.html',
      controller: 'TrialNoticeBannerCtrl',
      controllerAs: 'bannerCtrl',
      bindToController: true,
      scope: true
    };

    return directive;
  }
})();
