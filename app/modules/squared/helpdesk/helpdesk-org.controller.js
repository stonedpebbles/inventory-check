(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('HelpdeskOrgController', HelpdeskOrgController);

  /* @ngInject */
  function HelpdeskOrgController($anchorScroll, $location, $modal, $scope, $state, $stateParams, $translate, $window, Authinfo, Config, HelpdeskService, HelpdeskCardsOrgService, FeatureToggleService, FusionClusterService, LicenseService, Notification, UrlConfig) {
    $('body').css('background', 'white');
    var vm = this;
    if ($stateParams.org) {
      vm.org = $stateParams.org;
      vm.orgId = vm.org.id;
    } else {
      vm.orgId = $stateParams.id;
    }

    vm.messageCard = {};
    vm.meetingCard = {};
    vm.callCard = {};
    vm.hybridServicesCard = {};
    vm.roomSystemsCard = {};
    vm.userCard = {};

    vm.initialAdminUserLimit = 3;
    vm.adminUserLimit = vm.initialAdminUserLimit;
    vm.licenseUsageReady = false;
    vm.showLicenseToggles = [];
    vm.statusPageUrl = UrlConfig.getStatusPageUrl();
    vm.showAllAdminUsers = showAllAdminUsers;
    vm.hideAllAdminUsers = hideAllAdminUsers;
    vm.keyPressHandler = keyPressHandler;
    vm.daysLeftText = daysLeftText;
    vm.gotoSearchUsersAndDevices = gotoSearchUsersAndDevices;
    vm.usageText = usageText;
    vm.launchAtlasReadonly = launchAtlasReadonly;
    vm.isTrials = isTrials;
    vm.allowLaunchAtlas = false;
    vm.openExtendedInformation = openExtendedInformation;
    vm.supportsExtendedInformation = false;
    vm.cardsAvailable = false;
    vm.adminUsersAvailable = false;
    vm.findServiceOrders = findServiceOrders;
    vm.openHybridServicesModal = openHybridServicesModal;
    vm._helpers = {
      notifyError: notifyError
    };

    HelpdeskService.getOrg(vm.orgId).then(function (result) {
      initOrgView(result);
    }, function (result) {
      vm._helpers.notifyError(result);
    });

    FeatureToggleService.supports(FeatureToggleService.features.atlasHelpDeskExt).then(function (result) {
      vm.supportsExtendedInformation = result;
    });

    scrollToTop();

    function scrollToTop() {
      if ($location && $anchorScroll) {
        $location.hash('helpdeskPageTop');
        $anchorScroll();
      }
    }

    function setReadOnlyLaunchButtonVisibility(orgData) {
      if (orgData.id == Authinfo.getOrgId()) {
        vm.allowLaunchAtlas = false;
      } else if (!orgData.orgSettings) {
        vm.allowLaunchAtlas = true;
      } else {
        var orgSettings = JSON.parse(_.last(orgData.orgSettings));
        vm.allowLaunchAtlas = orgSettings.allowReadOnlyAccess;
      }
    }

    function isTrials(orgSettings) {
      var eft = false;
      if (orgSettings) {
        var orgSettingsJson = JSON.parse(_.last(orgSettings));
        eft = orgSettingsJson.isEFT;
      }
      return eft;
    }

    function openExtendedInformation() {
      if (vm.supportsExtendedInformation) {
        $modal.open({
          templateUrl: 'modules/squared/helpdesk/helpdesk-extended-information.html',
          controller: 'HelpdeskExtendedInfoDialogController as modal',
          resolve: {
            title: function () {
              return 'helpdesk.customerDetails';
            },
            data: function () {
              return vm.org;
            }
          }
        });
      }
    }

    function initOrgView(org) {
      vm.org = org;
      vm.delegatedAdministration = org.delegatedAdministration ? $translate.instant('helpdesk.delegatedAdministration', {
        numManages: org.manages ? org.manages.length : 0
      }) : null;

      LicenseService.getLicensesInOrg(vm.orgId).then(function (licenses) {
        initCards(licenses);
        findLicenseUsage();
      }, vm._helpers.notifyError);
      findManagedByOrgs(org);
      findWebExSites(org);
      findServiceOrders(vm.orgId);
      findAdminUsers(org);
      vm.supportedBy = isTrials(org.orgSettings) ? $translate.instant('helpdesk.trials') : $translate.instant('helpdesk.ts');
      angular.element(".helpdesk-details").focus();
      setReadOnlyLaunchButtonVisibility(org);
    }

    function initCards(licenses) {
      vm.messageCard = HelpdeskCardsOrgService.getMessageCardForOrg(vm.org, licenses);
      vm.meetingCard = HelpdeskCardsOrgService.getMeetingCardForOrg(vm.org, licenses);
      vm.callCard = HelpdeskCardsOrgService.getCallCardForOrg(vm.org, licenses);
      vm.hybridServicesCard = HelpdeskCardsOrgService.getHybridServicesCardForOrg(vm.org);
      vm.roomSystemsCard = HelpdeskCardsOrgService.getRoomSystemsCardForOrg(vm.org, licenses);
      vm.cardsAvailable = true;
    }

    function findManagedByOrgs(org) {
      if (org.managedBy && org.managedBy.length > 0) {
        org.managedByOrgs = [];
        _.each(org.managedBy, function (managingOrg) {
          HelpdeskService.getOrgDisplayName(managingOrg.orgId).then(function (displayName) {
            if (displayName) {
              org.managedByOrgs.push({
                id: managingOrg.orgId,
                displayName: displayName
              });
            }
          }, _.noop);
        });
      }
    }

    function findWebExSites(org) {
      if (LicenseService.orgIsEntitledTo(org, 'cloudMeetings')) {
        HelpdeskService.getWebExSites(vm.orgId).then(function (sites) {
          vm.org.webExSites = sites;
        }, vm._helpers.notifyError);
      }
    }

    function findServiceOrders(orgId) {
      HelpdeskService.getServiceOrders(orgId).then(function (orders) {
        var orderingSystemTypes = {
          APP_DIRECT: 'Partner Marketplace',
          ATLAS_TRIALS: 'Partner-Led Trial',
          CCW: 'Cisco Commerce',
          CISCO_ONLINE_OPC: 'Cisco Online Trial',
          DIGITAL_RIVER: 'Cisco Online Marketplace'
        };
        vm.orderSystems = [];
        _.forEach(orders, function (order) {
          vm.orderSystems.push(orderingSystemTypes[order.orderingTool] || order.orderingTool);
        });
      }, vm._helpers.notifyError);
    }

    function findAdminUsers(org) {
      HelpdeskService.usersWithRole(org.id, 'id_full_admin', 100).then(function (users) {
        vm.adminUsers = users;
        vm.showAllAdminUsersText = $translate.instant('helpdesk.showAllAdminUsers', {
          numUsers: users.length
        });
        vm.adminUsersAvailable = true;
      }, vm._helpers.notifyError);
    }

    function findLicenseUsage() {
      if (vm.orgId != Config.ciscoOrgId) {
        LicenseService.getLicensesInOrg(vm.orgId, true).then(function (licenses) {
          // Update the relevant cards with licenses that includes usage
          vm.messageCard = HelpdeskCardsOrgService.getMessageCardForOrg(vm.org, licenses);
          vm.meetingCard = HelpdeskCardsOrgService.getMeetingCardForOrg(vm.org, licenses);
          vm.callCard = HelpdeskCardsOrgService.getCallCardForOrg(vm.org, licenses);
          vm.roomSystemsCard = HelpdeskCardsOrgService.getRoomSystemsCardForOrg(vm.org, licenses);
          vm.licenseUsageReady = true;
        }, _.noop);
      }
    }

    function showAllAdminUsers() {
      vm.adminUserLimit = vm.adminUsers.length;
    }

    function hideAllAdminUsers() {
      vm.adminUserLimit = vm.initialAdminUserLimit;
    }

    function modalVisible() {
      return $('#HelpdeskExtendedInfoDialog').is(':visible');
    }

    function keyPressHandler(event) {
      if (!modalVisible()) {
        switch (event.keyCode) {
          case 27: // Esc
            $window.history.back();
            break;
          case 83: // S
            gotoSearchUsersAndDevices();
            break;
        }
      }
    }

    function daysLeftText(license) {
      return $translate.instant('helpdesk.numDaysLeft', {
        days: license.trialExpiresInDays
      });
    }

    function usageText(usage, volume) {
      return $translate.instant('helpdesk.usage', {
        usage: usage,
        volume: volume
      });
    }

    function gotoSearchUsersAndDevices() {
      $scope.$parent.helpdeskCtrl.initSearchWithOrgFilter(vm.org);
      $state.go('helpdesk.search');
    }

    function launchAtlasReadonly() {
      vm.launchingAtlas = true;
      HelpdeskService.elevateToReadonlyAdmin(vm.orgId).then(function () {
        $window.open($state.href('login_swap', {
          customerOrgId: vm.orgId,
          customerOrgName: vm.org.displayName
        }));
      }, vm._helpers.notifyError)
        .finally(function () {
          vm.launchingAtlas = false;
        });
    }

    function openHybridServicesModal() {
      vm.loadingHSData = true;
      FusionClusterService.getAll(vm.orgId)
        .then(function (hsData) {
          $modal.open({
            templateUrl: 'modules/squared/helpdesk/helpdesk-extended-information.html',
            controller: 'HelpdeskExtendedInfoDialogController as modal',
            resolve: {
              title: function () {
                return 'helpdesk.hybridServicesDetails';
              },
              data: function () {
                return hsData;
              }
            }
          });
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        })
        .finally(function () {
          vm.loadingHSData = false;
        });
    }

    function notifyError(response) {
      Notification.errorWithTrackingId(response, 'helpdesk.unexpectedError');
    }
  }
}());
