(function () {
  'use strict';

  angular.module('Core')
    .controller('OrganizationAddCtrl', OrganizationAddCtrl);

  /* @ngInject */
  function OrganizationAddCtrl($scope, $state, $translate, $q, Authinfo, Orgservice, HuronCustomer, Notification, Config, EmailService, ValidationService, AccountService) {
    var vm = this;

    vm.nameError = false;
    vm.emailError = false;
    vm.startDate = new Date();
    vm.isPartner = false;
    vm.offers = {};
    vm.model = {
      licenseCount: 100,
      duration: 90
    };

    vm.orgInfoFields = [{
      key: 'customerOrgName',
      type: 'input',
      templateOptions: {
        label: $translate.instant('organizationsPage.customerOrgName'),
        labelClass: 'col-xs-4',
        inputClass: 'col-xs-7',
        type: 'text',
        required: true
      }
    }, {
      key: 'customerAdminEmail',
      type: 'input',
      className: 'last-field',
      templateOptions: {
        label: $translate.instant('organizationsPage.customerAdminEmail'),
        labelClass: 'col-xs-4',
        inputClass: 'col-xs-7',
        type: 'email',
        required: true
      }
    }];

    vm.organizationTermsFields = [{
      key: 'isPartner',
      type: 'checkbox',
      templateOptions: {
        label: $translate.instant('organizationsPage.isPartner'),
        id: 'isPartner',
        class: 'col-xs-8 col-xs-offset-4'
      }
    }, {
      key: 'partnerAdminEmail',
      type: 'input',
      className: 'last-field',
      templateOptions: {
        label: $translate.instant('organizationsPage.partnerAdminEmail'),
        labelClass: 'col-xs-4',
        inputClass: 'col-xs-7',
        type: 'email',
        required: true
      },
      expressionProperties: {
        'hide': '!model.isPartner'
      }
    }, {
      key: 'beId',
      type: 'input',
      templateOptions: {
        label: $translate.instant('organizationsPage.beId'),
        labelClass: 'col-xs-4',
        inputClass: 'col-xs-7',
        type: 'text',
        required: true
      },
      expressionProperties: {
        'hide': '!model.isPartner'
      }
    }, {
      key: 'begeoId',
      type: 'input',
      templateOptions: {
        label: $translate.instant('organizationsPage.begeoId'),
        labelClass: 'col-xs-4',
        inputClass: 'col-xs-7',
        type: 'text',
        required: true
      },
      expressionProperties: {
        'hide': '!model.isPartner'
      }
    }, {
      key: 'COLLAB',
      type: 'checkbox',
      model: vm.offers,
      templateOptions: {
        label: $translate.instant('organizationsPage.collab'),
        id: 'squaredOrganization',
        class: 'col-xs-8 col-xs-offset-4'
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.isSquaredUCEnabled();
        }
      }
    }, {
      key: 'SQUAREDUC',
      type: 'checkbox',
      model: vm.offers,
      templateOptions: {
        label: $translate.instant('organizationsPage.squaredUC'),
        id: 'squaredUCOrganization',
        class: 'col-xs-8 col-xs-offset-4'
      },
      expressionProperties: {
        'hide': function () {
          return !vm.isSquaredUC;
        }
      }
    }, {
      key: 'duration',
      type: 'radio-list',
      templateOptions: {
        horizontal: true,
        label: $translate.instant('organizationsPage.duration'),
        labelClass: 'col-xs-4',
        inputClass: 'col-xs-7',
        options: [{
          label: $translate.instant('organizationsPage.ninetyDays'),
          value: 90,
          id: 'organization90'
        }, {
          label: $translate.instant('organizationsPage.onehundredtwentyDays'),
          value: 120,
          id: 'organization120'
        }, {
          label: $translate.instant('organizationsPage.onehundredeightyDays'),
          value: 180,
          id: 'organization180'
        }]
      }
    }, {
      key: 'licenseCount',
      type: 'input',
      className: 'last-field',
      templateOptions: {
        label: $translate.instant('organizationsPage.numberOfLicenses'),
        labelClass: 'col-xs-4',
        inputClass: 'col-xs-3',
        type: 'number',
        required: true
      },
      validators: {
        count: {
          expression: function ($viewValue, $modelValue) {
            return ValidationService.trialLicenseCount($viewValue, $modelValue);
          },
          message: function () {
            return $translate.instant('organizationsPage.invalidOrganizationLicenseCount');
          }
        }
      }
    }];

    $scope.$watch(function () {
      return vm.offers[Config.organizations.squaredUC];
    }, function (newValue) {
      if (newValue) {
        vm.offers[Config.organizations.collab] = true;
      }
    });

    vm.isSquaredUC = Authinfo.isSquaredUC;
    vm.isOffersEmpty = isOffersEmpty;

    vm.startOrganization = startOrganization;
    vm.isSquaredUCEnabled = isSquaredUCEnabled;

    function isOffersEmpty() {
      return !(vm.offers[Config.organizations.collab] || vm.offers[Config.organizations.squaredUC]);
    }

    function isSquaredUCEnabled() {
      return vm.offers[Config.organizations.squaredUC];
    }

    function startOrganization(keepModal) {
      vm.nameError = false;
      vm.emailError = false;
      angular.element('#startOrganizationButton').button('loading');

      var offersList = [];
      for (var i in vm.offers) {
        if (vm.offers[i]) {
          offersList.push(i);
        }
      }

      return AccountService.createAccount(vm.model.customerOrgName, vm.model.customerAdminEmail, vm.model.partnerAdminEmail, vm.model.isPartner, vm.model.beId, vm.model.begeoId, vm.model.duration, vm.model.licenseCount, offersList, vm.startDate)
        .catch(function (response) {
          angular.element('#startOrganizationButton').button('reset');
          Notification.notify([response.data.message], 'error');
          if ((response.data.message).indexOf('Org') > -1) {
            vm.nameError = true;
          } else if ((response.data.message).indexOf('Admin User') > -1) {
            vm.emailError = true;
          }
          return $q.reject(response);
        }).then(function (response) {
          vm.model.customerOrgId = response.data.customerOrgId;
          if (offersList.indexOf(Config.organizations.squaredUC) !== -1) {
            return HuronCustomer.create(response.data.customerOrgId, response.data.customerOrgName, response.data.customerAdminEmail)
              .catch(function (response) {
                angular.element('#startOrganizationButton').button('reset');
                Notification.errorResponse(response, 'organizationModal.squareducError');
                return $q.reject(response);
              });
          } else {
            return EmailService.emailNotifyOrganizationCustomer(vm.model.customerAdminEmail, vm.model.duration, vm.model.customerOrgId)
              .catch(function (response) {
                Notification.notify([$translate.instant('didManageModal.emailFailText')], 'error');
              });
          }
        }).then(function () {
          angular.element('#startOrganizationButton').button('reset');
          if (!keepModal) {
            $state.modal.close();
          }
          var successMessage = [$translate.instant('organizationModal.addSuccess', {
            customerOrgName: vm.model.customerOrgName,
            licenseCount: vm.model.licenseCount,
            duration: vm.model.duration
          })];
          Notification.notify(successMessage, 'success');
          return vm.model.customerOrgId;
        });
    }
  }
})();