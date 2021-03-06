(function () {
  'use strict';

  require('./main.dependencies');

  angular.module('Core', [
    'angular-cache',
    'atlas.templates',
    'collab.ui',
    'cisco.formly',
    'core.auth',
    'core.body',
    'core.languages',
    'core.localize',
    'core.logmetricsservice',
    'core.notifications',
    'core.onboard',
    'core.pageparam',
    'core.previousstate',
    'core.token',
    'core.trackingId',
    'core.trial',
    'core.utils',
    'csDonut',
    'ct.ui.router.extras.previous',
    'cwill747.phonenumber',
    'ngAnimate',
    'ngclipboard',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngMessages',
    'ngFileUpload',
    'ngCsv',
    'pascalprecht.translate',
    'ui.router',
    'ui.grid',
    'ui.grid.selection',
    'ui.grid.saveState',
    'ui.grid.infiniteScroll',
    'timer',
    'toaster',
    'rzModule',
    'dragularModule',
    require('modules/core/analytics'),
    require('modules/core/featureToggle/featureToggle.service'),
    require('modules/core/scripts/services/org.service'),
    require('modules/core/scripts/services/userlist.service'),
    require('modules/core/users/userCsv/userCsv.service'),
    require('modules/core/cards').default,
    require('modules/core/window').default,
    require('modules/online/digitalRiver').default // TODO make core.myCompany independent module
  ])
    .constant('CryptoJS', require('crypto-js'))
    .constant('phone', require('google-libphonenumber'))
    .constant('addressparser', require('emailjs-addressparser'));

  // TODO fix circular dependencies between modules
  angular.module('Squared', ['Core', 'Hercules', 'Huron', 'Sunlight']);

  angular.module('DigitalRiver', ['Core']);

  angular.module('Huron', [
    'Core',
    'uc.device',
    'uc.didadd',
    'uc.overview',
    'uc.hurondetails',
    'uc.cdrlogsupport',
    'uc.autoattendant',
    'ngIcal',
    'huron.paging-group',
    'huron.call-pickup',
    'huron.telephoneNumber',
    'huron.call-park',
    'huron.bulk-enable-vm',
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/huron/telephony/cmiServices'),
  ]);

  angular.module('Hercules', ['Core', 'Squared', 'core.onboard', 'ngTagsInput']);

  angular.module('HDS', ['Core']);

  angular.module('Ediscovery', ['Core']);

  angular.module('Mediafusion', ['Core', 'Hercules', 'Squared']);

  angular.module('WebExApp', ['Core']);

  angular.module('Messenger', ['Core']);

  angular.module('Sunlight', [
    'Core',
    'CareDetails'
  ]);

  angular.module('GSS', ['Core']);

  angular.module('Gemini', ['Core']);

  module.exports = angular.module('Main', [
    'Core',
    'Squared',
    'DigitalRiver',
    'Huron',
    'Hercules',
    'Ediscovery',
    'Mediafusion',
    'HDS',
    'WebExApp',
    'Messenger',
    'Sunlight',
    'GSS',
    'oc.lazyLoad',
    'Gemini'
  ]).config(require('./main.config'))
    .run(require('./main.run'))
    .name;

  // require all modules first
  requireAll(require.context("modules/", true, /\.module\.(js|ts)$/));
  // require all other app files - ignore bootstrap.js and preload.js
  requireAll(require.context("../", true, /\.\/(?!.*(\.spec|bootstrap.js$|scripts\/preload.js$)).*\.(js|ts)$/));
  // require all other assets
  requireAll(require.context("../", true, /\.(jpg|png|svg|ico|json|csv|pdf)$/));

  function requireAll(requireContext) {
    return requireContext.keys().forEach(requireContext);
  }
}());
