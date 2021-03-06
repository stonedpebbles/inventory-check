(function () {
  'use strict';

  angular.module('Core')
    .service('PartnerService', PartnerService)
    .factory('ScimPatchService', ScimPatchService);

  /* @ngInject */
  function PartnerService($http, $rootScope, $q, $translate, Analytics, Authinfo, Auth, Config, TrialService, UrlConfig, UserRoleService) {
    var managedOrgsUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/managedOrgs';
    var siteListUrl = UrlConfig.getAdminServiceUrl() + 'organizations/%s/sitesProvOrderStatus';

    var customerStatus = {
      FREE: 0,
      TRIAL: 1,
      ACTIVE: 2,
      CANCELED: 99,
      NO_LICENSE: -1,
      NOTE_EXPIRED: 0,
      NOTE_EXPIRE_TODAY: 0,
      NOTE_NO_LICENSE: 0,
      NOTE_CANCELED: 0,
      NOTE_NOT_EXPIRED: 99
    };

    var helpers = {
      createConferenceMapping: _createConferenceMapping,
      createRoomMapping: _createRoomMapping,
      createLicenseMapping: _createLicenseMapping,
      createFreeServicesMapping: _createFreeServicesMapping,
      LicensedService: _LicensedService,
      addService: _addService,
      removeFromFreeServices: _removeFromFreeServices,
      isDisplayableService: _isDisplayableService,
      calculatePurchaseStatus: _calculatePurchaseStatus,
      calculateTotalLicenses: _calculateTotalLicenses,
      countUniqueServices: _countUniqueServices
    };

    var factory = {
      customerStatus: customerStatus,
      getManagedOrgsList: getManagedOrgsList,
      modifyManagedOrgs: modifyManagedOrgs,
      isLicenseATrial: isLicenseATrial,
      isLicenseActive: isLicenseActive,
      isLicenseFree: isLicenseFree,
      getLicense: getLicense,
      isLicenseInfoAvailable: isLicenseInfoAvailable,
      setServiceSortOrder: setServiceSortOrder,
      setNotesSortOrder: setNotesSortOrder,
      loadRetrievedDataToList: loadRetrievedDataToList,
      exportCSV: exportCSV,
      parseLicensesAndOffers: parseLicensesAndOffers,
      getFreeOrActiveServices: getFreeOrActiveServices,
      getSiteUrls: getSiteUrls,
      isLicenseTypeAny: isLicenseTypeAny,
      getTrialMeetingServices: getTrialMeetingServices,
      helpers: helpers
    };

    return factory;

    function _createConferenceMapping() {
      var conferenceMapping = {};
      conferenceMapping[Config.offerCodes.CF] = {
        translatedOfferCode: $translate.instant('trials.meeting'),
        order: 1
      };
      conferenceMapping[Config.offerCodes.MC] = {
        translatedOfferCode: $translate.instant('customerPage.MC'),
        order: 2
      };
      conferenceMapping[Config.offerCodes.EE] = {
        translatedOfferCode: $translate.instant('customerPage.EE'),
        order: 3
      };
      conferenceMapping[Config.offerCodes.TC] = {
        translatedOfferCode: $translate.instant('customerPage.TC'),
        order: 4
      };
      conferenceMapping[Config.offerCodes.SC] = {
        translatedOfferCode: $translate.instant('customerPage.SC'),
        order: 5
      };
      conferenceMapping[Config.offerCodes.EC] = {
        translatedOfferCode: $translate.instant('customerPage.EC'),
        order: 6
      };
      conferenceMapping[Config.offerCodes.CMR] = {
        translatedOfferCode: $translate.instant('customerPage.CMR'),
        order: 7
      };

      conferenceMapping = _.mapValues(conferenceMapping, function (offer) {
        return {
          name: offer.translatedOfferCode,
          order: offer.order,
          icon: 'icon-circle-group',
          licenseType: Config.licenseTypes.CONFERENCING
        };
      });
      return conferenceMapping;
    }

    function _createRoomMapping() {
      var offerMapping = {};
      offerMapping[Config.offerCodes.SD] = {
        translatedOfferCode: $translate.instant('trials.sharedDevice'),
        icon: 'icon-circle-telepresence',
        order: 6
      };
      offerMapping[Config.offerCodes.SB] = {
        translatedOfferCode: $translate.instant('trials.sparkBoardSystem'),
        icon: 'icon-circle-telepresence',
        order: 6
      };
    }

    function _createLicenseMapping() {
      var licenseMapping = {};
      licenseMapping[Config.licenseTypes.MESSAGING] = {
        name: $translate.instant('trials.message'),
        icon: 'icon-circle-message',
        order: 0
      };

      licenseMapping[Config.licenseTypes.COMMUNICATION] = {
        name: $translate.instant('trials.call'),
        icon: 'icon-circle-call',
        order: 3
      };

      licenseMapping[Config.licenseTypes.SHARED_DEVICES] = {
        name: $translate.instant('subscriptions.room'),
        icon: 'icon-circle-telepresence',
        isRoom: true,
        order: 6
      };

      licenseMapping[Config.licenseTypes.CARE] = {
        name: $translate.instant('trials.care'),
        icon: 'icon-circle-contact-centre',
        order: 5
      };
      return licenseMapping;
    }

    function _createFreeServicesMapping() {
      var freeServices = [{
        licenseType: Config.licenseTypes.MESSAGING,
        name: $translate.instant('trials.message'),
        icon: 'icon-circle-message',
        code: Config.offerCodes.MS,
        qty: 0,
        free: true,
        order: 20

      }, {
        licenseType: Config.licenseTypes.CONFERENCING,
        name: $translate.instant('customerPage.meeting'),
        icon: 'icon-circle-group',
        code: Config.offerCodes.CF,
        qty: 0,
        free: true,
        order: 21
      }, {
        licenseType: Config.licenseTypes.COMMUNICATION,
        name: $translate.instant('trials.call'),
        icon: 'icon-circle-call',
        code: Config.offerCodes.CO,
        qty: 0,
        free: true,
        order: 22
      }];
      return freeServices;

    }

    function _LicensedService(licenseInfo, mapping) {
      var isConference = (mapping[Config.offerCodes.CF] !== undefined);
      var service;
      if (isConference) {
        service = (licenseInfo.offerName) ? mapping[licenseInfo.offerName] : mapping[Config.offerCodes.CF];
      } else {
        service = mapping[licenseInfo.licenseType];
        service.licenseType = licenseInfo.licenseType;
      }

      _.assign(this, service);
      this.qty = licenseInfo.volume || 0;

    }

    function _addService(services, service) {
      var existingService = _.find(services, {
        name: service.name
      });
      if (existingService) {
        existingService.qty = existingService.qty + service.qty;
      } else {
        services.push(service);
      }
    }

    function _removeFromFreeServices(freeServices, service) {
      //remove trial or paid services from 'free'
      _.remove(freeServices, function (freeService) {
        if (service.offerName) {
          return freeService.licenseType === service.licenseType && freeService.code === service.offerName;
        } else {
          return freeService.licenseType === service.licenseType;
        }
      });
    }

    function _isDisplayableService(service, options) {
      var isTrial = options.isTrial;
      var isShowCMR = options.isShowCMR;
      var isCareEnabled = options.isCareEnabled;

      var serviceNotCareOrCareIsShown = (service.licenseType !== Config.licenseTypes.CARE) || isCareEnabled;
      var serviceNotHiddenWebex = ((service.licenseType !== Config.licenseTypes.STORAGE) && (isShowCMR || service.licenseType !== Config.licenseTypes.CMR));
      //if 'isTrial' it has to be true. Otherwise any falso value is fine
      var correctServiceStatus = true;
      if (isTrial !== undefined) {
        correctServiceStatus = (isTrial) ? (service.isTrial === true) : !service.isTrial;
      }
      return (serviceNotHiddenWebex && serviceNotCareOrCareIsShown && correctServiceStatus);
    }

    function getManagedOrgsList(searchText) {
      return $http.get(managedOrgsUrl, {
        params: {
          customerName: searchText
        }
      });
    }

    function modifyManagedOrgs(customerOrgId) {
      return Auth.getAuthorizationUrlList().then(function (response) {
        if (response.status === 200 && (_.indexOf(response.data.managedOrgs, customerOrgId) < 0)) {
          var primaryEmail = Authinfo.getPrimaryEmail();
          Analytics.trackPartnerActions(Analytics.sections.TRIAL.eventNames.PATCH, response.data.orgId, response.data.uuid);
          return UserRoleService.enableFullAdmin(primaryEmail, customerOrgId);
        }
      });
    }

    function getLicenseObj(rowData, licenseTypeField) {
      return rowData[licenseTypeField] || null;
    }

    // Series of fns dont make any sense, unless isTrial = null means something...
    function isLicenseATrial(license) {
      return license && license.isTrial === true;
    }

    function isLicenseActive(license) {
      return license && license.isTrial === false;
    }

    function isLicenseFree(license) {
      return license && _.isUndefined(license.isTrial);
    }
    // end series of fn's

    function isLicenseTypeAny(customerData, licenseTypeField) {
      if (!isLicenseInfoAvailable(customerData.licenseList)) {
        return false;
      }
      if (licenseTypeField === 'webex') {
        // if given generic "webex" check all possibilities
        return _.some(Config.webexTypes, function (webexType) {
          var licenseObj = getLicenseObj(customerData, webexType);
          return isLicenseATrial(licenseObj) || isLicenseActive(licenseObj);
        });
      } else {
        var licenseObj = getLicenseObj(customerData, licenseTypeField);
        var isFreeLicense = isLicenseFree(licenseObj) && _.includes(Config.freeLicenses, licenseTypeField);
        return isLicenseATrial(licenseObj) || isLicenseActive(licenseObj) || isFreeLicense;
      }
    }

    function getLicense(licenses, offerCode, customerListToggle) {
      if (!customerListToggle) {
        return _.find(licenses, {
          offerName: offerCode
        }) || {};
      }
      var offers = _.filter(licenses, {
        offerName: offerCode
      });
      return (offers.length === 0) ? {} : offers;
    }

    function isLicenseInfoAvailable(licenses) {
      return _.isArray(licenses);
    }

    function setServiceSortOrder(license) {
      if (_.isEmpty(license)) {
        license.sortOrder = customerStatus.NO_LICENSE;
      } else if (license.status === 'CANCELED') {
        license.sortOrder = customerStatus.CANCELED;
      } else if (isLicenseFree(license)) {
        license.sortOrder = customerStatus.FREE;
      } else if (isLicenseATrial(license)) {
        license.sortOrder = customerStatus.TRIAL;
      } else if (isLicenseActive(license)) {
        license.sortOrder = customerStatus.ACTIVE;
      } else {
        license.sortOrder = customerStatus.NO_LICENSE;
      }
    }

    function setNotesSortOrder(rowData) {
      var notes = {};
      notes.daysLeft = rowData.daysLeft;
      if (isLicenseInfoAvailable(rowData.licenseList)) {
        if (rowData.status === 'CANCELED') {
          notes.sortOrder = customerStatus.NOTE_CANCELED;
          notes.text = $translate.instant('customerPage.suspended');
        } else if (rowData.purchased) {
          notes.sortOrder = customerStatus.ACTIVE;
          notes.text = $translate.instant('customerPage.purchased');
        } else if (rowData.customerOrgId === Authinfo.getOrgId()) {
          notes.sortOrder = customerStatus.ACTIVE;
          notes.text = $translate.instant('customerPage.myOrganization');
        } else if (rowData.status === 'ACTIVE' || rowData.status === 'EXPIRED') {
          // while "daysLeft > 0" and expired doesn't make sense, the other 2 cases have the same text
          if (rowData.daysLeft > 0) {
            notes.sortOrder = customerStatus.NOTE_NOT_EXPIRED;
            notes.text = $translate.instant('customerPage.daysLeftToPurchase', {
              count: rowData.daysLeft
            }, 'messageformat');
          } else if (rowData.daysLeft === 0) {
            notes.sortOrder = customerStatus.NOTE_EXPIRE_TODAY;
            notes.text = $translate.instant('customerPage.expiringToday');
          } else if (rowData.daysLeft < 0) {
            notes.sortOrder = customerStatus.NOTE_EXPIRED;
            // equal to the maximum days past expiration, always negative!
            var gracePeriodDays = Config.trialGracePeriod;
            if (_.inRange(rowData.daysLeft, 0, gracePeriodDays)) {
              notes.text = $translate.instant('customerPage.expiredWithGracePeriod');
            } else {
              notes.text = $translate.instant('customerPage.expired');
            }
          }
        }
      }
      // If any of the previous tests fail, fall back to no license info
      if (!_.has(notes, 'text')) {
        notes.sortOrder = customerStatus.NOTE_NO_LICENSE;
        notes.text = $translate.instant('customerPage.licenseInfoNotAvailable');
      }
      rowData.notes = notes;
    }

    function loadRetrievedDataToList(list, isTrialData, isCareEnabled, customerListToggle) {
      return _.map(list, function (customer) {
        return massageDataForCustomer(customer, isTrialData, isCareEnabled, customerListToggle);
      });
    }

    function massageDataForCustomer(customer, isTrialData, isCareEnabled, customerListToggle) {
      var edate = moment(customer.startDate).add(customer.trialPeriod, 'days').format('MMM D, YYYY');
      var dataObj = {
        trialId: customer.trialId,
        customerOrgId: customer.customerOrgId || customer.id,
        customerName: customer.customerName || customer.displayName,
        customerEmail: customer.customerEmail || customer.email,
        endDate: edate,
        startDate: customer.startDate,
        numUsers: customer.allUsers || 0, // sometimes we get back undefined users, temp workaround
        activeUsers: customer.activeUsers || 0,
        daysLeft: 0,
        usage: 0,
        licenses: 0,
        deviceLicenses: 0,
        licenseList: [],
        messaging: null,
        conferencing: null,
        communications: null,
        roomSystems: null,
        sparkConferencing: null,
        webexEEConferencing: null,
        webexCMR: null,
        care: null,
        daysUsed: 0,
        percentUsed: 0,
        duration: customer.trialPeriod,
        dealId: customer.dealId,
        offer: {},
        offers: customer.offers,
        status: customer.state,
        state: customer.state,
        isAllowedToManage: true,
        isSquaredUcOffer: false,
        notes: {},
        isPartner: false,
        isTrialData: isTrialData
      };

      var licensesAndOffersData = parseLicensesAndOffers(customer, { isCareEnabled: isCareEnabled });
      _.assign(dataObj, licensesAndOffersData);

      dataObj.isAllowedToManage = isTrialData || customer.isAllowedToManage;
      dataObj.isPartner = _.get(customer, 'isPartner', false);
      dataObj.unmodifiedLicenses = _.cloneDeep(customer.licenses);
      dataObj.licenseList = customer.licenses;

      var daysDone = TrialService.calcDaysUsed(customer.startDate);
      dataObj.daysUsed = daysDone;
      dataObj.percentUsed = Math.round((daysDone / customer.trialPeriod) * 100);

      var daysLeft = TrialService.calcDaysLeft(customer.startDate, customer.trialPeriod);
      dataObj.daysLeft = daysLeft;
      if (isTrialData) {
        if (daysLeft < 0) {
          dataObj.status = $translate.instant('customerPage.expired');
          dataObj.state = 'EXPIRED';
        }
      }

      var serviceEntry = {
        status: dataObj.status,
        daysLeft: daysLeft,
        customerName: dataObj.customerName
      };

      // havent figured out what this is doing yet...
      dataObj.sparkConferencing = initializeService(customer.licenses, Config.offerCodes.CF, serviceEntry, customerListToggle);
      dataObj.webexCMR = initializeService(customer.licenses, Config.offerCodes.CMR, serviceEntry, customerListToggle);
      dataObj.communications = initializeService(customer.licenses, Config.offerCodes.CO, serviceEntry, customerListToggle);
      dataObj.webexEventCenter = initializeService(customer.licenses, Config.offerCodes.EC, serviceEntry, customerListToggle);
      dataObj.webexEEConferencing = initializeService(customer.licenses, Config.offerCodes.EE, serviceEntry, customerListToggle);
      dataObj.webexMeetingCenter = initializeService(customer.licenses, Config.offerCodes.MC, serviceEntry, customerListToggle);
      dataObj.messaging = initializeService(customer.licenses, Config.offerCodes.MS, serviceEntry, customerListToggle);
      dataObj.webexSupportCenter = initializeService(customer.licenses, Config.offerCodes.SC, serviceEntry, customerListToggle);
      dataObj.roomSystems = initializeService(customer.licenses, Config.offerCodes.SD, serviceEntry, customerListToggle);
      dataObj.webexTrainingCenter = initializeService(customer.licenses, Config.offerCodes.TC, serviceEntry, customerListToggle);
      dataObj.webexCMR = initializeService(customer.licenses, Config.offerCodes.CMR, serviceEntry, customerListToggle);
      dataObj.care = initializeService(customer.licenses, Config.offerCodes.CDC, serviceEntry, customerListToggle);

      // 12/17/2015 - Timothy Trinh
      // setting conferencing to sparkConferencing for now to preserve how
      // the customer list page currently works.
      dataObj.conferencing = dataObj.sparkConferencing;

      dataObj.purchased = _calculatePurchaseStatus(dataObj);

      dataObj.totalLicenses = _calculateTotalLicenses(dataObj, isCareEnabled, customerListToggle);
      dataObj.uniqueServiceCount = _countUniqueServices(dataObj);


      setNotesSortOrder(dataObj);
      return dataObj;
    }

    function _calculatePurchaseStatus(customerData) {
      if (customerData.state === Config.licenseStatus.ACTIVE && customerData.licenseList) {
        return !(customerData.licenseList.length === 0 || _.some(customerData.licenseList, 'isTrial'));
      } else {
        return false;
      }
    }


    function _calculateTotalLicenses(customerData, isCareEnabled, customerListToggle) {
      if (customerData.purchased || customerData.isPartner || customerListToggle) {
        return _.sumBy(customerData.licenseList, function (license) {
          if (!helpers.isDisplayableService(license, { isTrial: undefined, isShowCMR: false, isCareEnabled: isCareEnabled })) {
            return 0;
          } else {
            return license.volume || 0;
          }
        });
      } else {
        // device and care licenses can be undefined
        return customerData.licenses +
              (customerData.deviceLicenses || 0) +
              (isCareEnabled ? (customerData.careLicenses || 0) : 0);
      }
    }

    function _countUniqueServices(customerData) {
      var count = 0;
      // only want to add 1 for webex since it is only 1 icon
      var foundWebex = false;
      _.forEach(Config.licenseObjectNames, function (licenseName) {
        if (isLicenseTypeAny(customerData, licenseName)) {
          if (_.startsWith(licenseName, 'webex')) {
            if (!foundWebex) {
              count += 1;
              foundWebex = true;
            }
          } else {
            count += 1;
          }
        }
      });
      return count;
    }

    function initializeService(licenses, offerCode, serviceEntry, customerListToggle) {
      var licensesGotten = getLicense(licenses, offerCode, customerListToggle);
      if (!_.isArray(licensesGotten)) {
        _.assign(licensesGotten, serviceEntry);
        setServiceSortOrder(licensesGotten);
        return licensesGotten;
      } else {
        var result = {};
        _.assign(result, licensesGotten[0], serviceEntry);
        var qty = _.reduce(licensesGotten, function (volume, license) {
          return volume + license.volume;
        }, 0);
        result.volume = qty;
        setServiceSortOrder(result);
        return result;
      }

    }

    function exportCSV(isCareEnabled) {
      $rootScope.exporting = true;
      $rootScope.$broadcast('EXPORTING');

      // dont catch exception, if there was a problem, throw it
      // (this is preexisting behavior)
      return getManagedOrgsList()
        .then(function (response) {
          // data to export for CSV file customer.conferencing.features[j]
          var exportedCustomers = _.map(response.data.organizations, function (customer) {
            var exportedCustomer = {};

            exportedCustomer.customerName = customer.customerName;
            exportedCustomer.adminEmail = customer.customerEmail;
            exportedCustomer.messagingEntitlements = '';
            exportedCustomer.conferenceEntitlements = '';
            exportedCustomer.communicationsEntitlements = '';
            exportedCustomer.roomSystemsEntitlements = '';

            var messagingLicense = _.find(customer.licenses, {
              licenseType: Config.licenseTypes.MESSAGING
            });
            var conferenceLicense = _.find(customer.licenses, {
              licenseType: Config.licenseTypes.CONFERENCING
            });
            var communicationsLicense = _.find(customer.licenses, {
              licenseType: Config.licenseTypes.COMMUNICATION
            });
            var roomSystemsLicense = _.find(customer.licenses, {
              licenseType: Config.licenseTypes.SHARED_DEVICES
            });
            var careLicense = _.find(customer.licenses, {
              licenseType: Config.licenseTypes.CARE
            });

            if (messagingLicense && _.isArray(messagingLicense.features)) {
              exportedCustomer.messagingEntitlements = messagingLicense.features.join(' ');
            }
            if (conferenceLicense && _.isArray(conferenceLicense.features)) {
              exportedCustomer.conferenceEntitlements = conferenceLicense.features.join(' ');
            }
            if (communicationsLicense && _.isArray(communicationsLicense.features)) {
              exportedCustomer.communicationsEntitlements = communicationsLicense.features.join(' ');
            }
            if (roomSystemsLicense && _.isArray(roomSystemsLicense.features)) {
              exportedCustomer.roomSystemsEntitlements = roomSystemsLicense.features.join(' ');
            }
            if (isCareEnabled) {
              if (careLicense && _.isArray(careLicense.features)) {
                exportedCustomer.careEntitlements = careLicense.features.join(' ');
              }
            }
            return exportedCustomer;
          });

          // header line for CSV file
          // 12/17/2015 - Timothy Trinh
          // Did not bother to add webex entitlements to this section because it may change.
          var header = {};
          header.customerName = $translate.instant('customerPage.csvHeaderCustomerName');
          header.adminEmail = $translate.instant('customerPage.csvHeaderAdminEmail');
          header.messagingEntitlements = $translate.instant('customerPage.csvHeaderMessagingEntitlements');
          header.conferencingEntitlements = $translate.instant('customerPage.csvHeaderConferencingEntitlements');
          header.communicationsEntitlements = $translate.instant('customerPage.csvHeaderCommunicationsEntitlements');
          header.roomSystemsEntitlements = $translate.instant('customerPage.csvHeaderRoomSystemsEntitlements');

          if (isCareEnabled) {
            header.careEntitlements = $translate.instant('customerPage.csvHeaderCareEntitlements');
          }

          exportedCustomers.unshift(header);
          return exportedCustomers;
        });
    }

    function getTrialMeetingServices(licenseList) {
      var conferenceMapping = helpers.createConferenceMapping();
      var meetingServices = [];
      _.forEach(licenseList, function (licenseInfo) {
        if (licenseInfo.isTrial) {
          if (licenseInfo.licenseType === Config.licenseTypes.CONFERENCING || licenseInfo.licenseType === Config.licenseTypes.CMR) {
            var service = new helpers.LicensedService(licenseInfo, conferenceMapping);
            helpers.addService(meetingServices, service);
          }
        }
      });
      return meetingServices;
    }

    function parseLicensesAndOffers(customer, options) {
      var partial = {
        licenses: 0,
        deviceLicenses: 0,
        isSquaredUcOffer: false,
        usage: 0,
        offer: {}
      };
      var isCareEnabled = _.get(options, 'isCareEnabled', true);
      var userServiceMapping = helpers.createLicenseMapping();
      var conferenceServices = [];
      var roomServices = [];
      var trialService;
      var trialServices = [];

      _.forEach(_.get(customer, 'licenses', []), function (licenseInfo) {
        if (!licenseInfo) {
          return;
        }
        switch (licenseInfo.licenseType) {
          case Config.licenseTypes.COMMUNICATION:
            partial.isSquaredUcOffer = true;
            break;
        }
      });

      for (var offer in _.get(customer, 'offers', [])) {
        var offerInfo = customer.offers[offer];
        if (!offerInfo) {
          continue;
        }
        partial.usage = offerInfo.usageCount;
        if (offerInfo.id !== Config.offerTypes.roomSystems &&
          offerInfo.id !== Config.offerTypes.care) {
          partial.licenses = offerInfo.licenseCount;
        }
        trialService = null;
        switch (offerInfo.id) {
          case Config.offerTypes.spark1:
          case Config.offerTypes.message:
          case Config.offerTypes.collab:
            trialService = userServiceMapping[Config.licenseTypes.MESSAGING];
            break;
          case Config.offerTypes.call:
          case Config.offerTypes.squaredUC:
            partial.isSquaredUcOffer = true;
            trialService = userServiceMapping[Config.licenseTypes.COMMUNICATION];
            break;
          case Config.offerTypes.webex:
          case Config.offerTypes.meetings:
            conferenceServices.push({
              name: $translate.instant('customerPage.EE'),
              order: 1,
              qty: offerInfo.licenseCount,
              isWebex: true
            });
            break;
          case Config.offerTypes.meeting:
            conferenceServices.push({
              offerType: offerInfo.id,
              name: $translate.instant('trials.meeting'),
              order: 1,
              qty: offerInfo.licenseCount
            });
            break;
          case Config.offerTypes.roomSystems:
            roomServices.push({
              offerType: offerInfo.id,
              name: $translate.instant('trials.roomSystem'),
              order: 1,
              qty: offerInfo.licenseCount,
            });
            break;
          case Config.offerTypes.sparkBoard:
            roomServices.push({
              offerType: offerInfo.id,
              name: $translate.instant('trials.sparkBoardSystem'),
              order: 2,
              qty: offerInfo.licenseCount,
            });
            break;
          case Config.offerTypes.care:
            if (isCareEnabled) {
              trialService = userServiceMapping[Config.licenseTypes.CARE];
              partial.careLicenses = offerInfo.licenseCount;
            }
            break;
        }
        if (trialService) {
          trialService.qty = offerInfo.licenseCount;
          trialServices.push(trialService);
        }
      }

      if (conferenceServices.length > 0) {
        var name = _.chain(conferenceServices).sortBy('order').map(function (o) {
          return o.name;
        })
        .uniq()
        .value()
        .join(', ');
        var licenseQty = conferenceServices[0].qty;
        var hasWebex = _.some(conferenceServices, { isWebex: true });
        trialServices.push({ name: name, sub: conferenceServices, qty: licenseQty, icon: 'icon-circle-group', order: 1, hasWebex: hasWebex });
      }

      if (roomServices.length > 0) {
        trialService = userServiceMapping[Config.licenseTypes.SHARED_DEVICES];
        partial.isRoomSystems = true;
        var sbTrial = _.chain(roomServices)
          .filter({ offerType: Config.offerTypes.sparkBoard })
          .last()
          .value();
        var sdTrial = _.chain(roomServices)
          .filter({ offerType: Config.offerTypes.roomSystems })
          .last()
          .value();
        trialService.sub = [];
        if (sbTrial) {
          partial.deviceLicenses += sbTrial.qty || 0;
          trialService.sub.push(sbTrial);
        }
        if (sdTrial) {
          partial.deviceLicenses += sdTrial.qty || 0;
          trialService.sub.push(sdTrial);
        }
        trialService.qty = partial.deviceLicenses;
        trialServices.push(trialService);
      }

      partial.offer.trialServices = _.chain(trialServices).sortBy('order').uniq().value();
      return partial;
    }

    function getFreeOrActiveServices(customer, options) {

      var paidServices = [];
      var meetingServices = [];
      var service = null;
      var result = null;
      var isCareEnabled = options.isCareEnabled;
      var isTrial = options.isTrial;

      var meetingHeader = {
        licenseType: 'MEETING',
        isMeeting: true,
        name: $translate.instant('customerPage.meeting'),
        icon: 'icon-circle-group',
        order: 1
      };

      var licenseMapping = helpers.createLicenseMapping();
      var conferenceMapping = helpers.createConferenceMapping();
      var freeServices = helpers.createFreeServicesMapping();

      _.forEach(_.get(customer, 'licenseList', []), function (licenseInfo) {
        service = null;
        if (licenseInfo) {
          helpers.removeFromFreeServices(freeServices, licenseInfo);
          //from paid or free services
          if (helpers.isDisplayableService(licenseInfo, { isTrial: isTrial, isShowCMR: true, isCareEnabled: isCareEnabled })) { //if conference
            if (licenseInfo.licenseType === Config.licenseTypes.CONFERENCING || licenseInfo.licenseType === Config.licenseTypes.CMR) {
              service = new helpers.LicensedService(licenseInfo, conferenceMapping);
              helpers.addService(meetingServices, service);
            } else {
              service = new helpers.LicensedService(licenseInfo, licenseMapping);
              helpers.addService(paidServices, service);
            }
          }
        }
      });

      //if only one meeting service -- move to the services list
      if (meetingServices.length === 1) {
        var singleMeetingService = meetingServices.shift();
        helpers.addService(paidServices, singleMeetingService);
      }

      //if there is more than one
      if (meetingServices.length >= 1) {
        var totalQ = _.reduce(meetingServices, function (prev, curr) {

          return (curr.licenseType !== Config.licenseTypes.CMR) ? {
            qty: prev.qty + curr.qty
          } : {
            qty: prev.qty + 0
          };
        });

        _.merge(meetingHeader, {
          qty: totalQ.qty,
          sub: _.sortBy(meetingServices, 'order')
        });

        paidServices.push(meetingHeader);
      }

      if (freeServices.length > 0 || paidServices.length > 0) {
        result = _.sortBy(_.union(freeServices, paidServices), 'order');
      }
      return result;
    }

    function getSiteUrls(customerId) {
      var url;
      if (!customerId) {
        return $q.reject('A Customer Organization Id must be passed');
      } else {
        url = _.replace(siteListUrl, '%s', customerId);
        return $http.get(url);
      }
    }
  }
  /* @ngInject */
  function ScimPatchService($resource, Authinfo, UrlConfig) {
    return $resource(UrlConfig.getScimUrl(Authinfo.getOrgId()) + '/:userId', {
      userId: '@userId'
    }, {
      'update': {
        method: 'PATCH'
      }
    });
  }

})();
