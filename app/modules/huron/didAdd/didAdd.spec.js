'use strict';

describe('Controller: DidAddCtrl', function () {
  var controller, $q, $scope, $state, $httpBackend, $window, HuronConfig, Notification, Config, EmailService, DialPlanService;

  beforeEach(module('Huron'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1'),
    getOrgName: sinon.stub().returns('awesomeco')
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  var stateParams = {
    currentOrg: {
      customerOrgId: '1',
      customerName: 'JEFFCO',
      customerEmail: 'jeffcoiscoolio@jeffco.com'
    }
  };

  var trial = {
    model: {
      customerEmail: 'flast@company.com',
      licenseDuration: '90',
      customerOrgId: '0000000000000001'
    }
  };

  var clusters = getJSONFixture('huron/json/dialPlans/clusters.json');
  var customerVoiceAustalia = getJSONFixture('huron/json/dialPlans/customervoice-aunp.json');
  var customerVoiceNorthAmerica = getJSONFixture('huron/json/dialPlans/customervoice-nanp.json');
  var dialPlans = getJSONFixture('huron/json/dialPlans/dialplans.json');
  var dialPlanDetailsAustralia = getJSONFixture('huron/json/dialPlans/dialplandetails-aunp.json');
  var dialPlanDetailsNorthAmerica = [{
    countryCode: "+1",
    extensionGenerated: "false",
    steeringDigitRequired: "true"
  }];
  var uuids = {
    orgId: '1',
    clusterId: '00000000-0000-0000-0000-000000000001',
    dialPlanIdAudp: '00000000-0000-0000-0000-000000000009',
    dialPlanIdNadp: '00000000-0000-0000-0000-000000000010',
  };

  beforeEach(inject(function (_$q_, $rootScope, $controller, _$httpBackend_, _HuronConfig_, _Notification_, _Config_, _EmailService_, $timeout, _$window_, _$state_, _DialPlanService_) {
    $q = _$q_;
    $scope = $rootScope.$new();
    $scope.trial = trial;

    $httpBackend = _$httpBackend_;
    $window = _$window_;
    $state = _$state_;
    $state.modal = {
      close: sinon.stub(),
      result: {
        finally: sinon.stub()
      }
    };
    HuronConfig = _HuronConfig_;
    Config = _Config_;
    Notification = _Notification_;
    EmailService = _EmailService_;
    $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools?order=pattern').respond(200, [{
      'pattern': '+12145559991',
      'uuid': '12145559991-id'
    }, {
      'pattern': '+12145558881',
      'uuid': '12145558881-id'
    }]);

    $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/common/clusters?type=APPLICATION_VOICE').respond(clusters);
    $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/common/clusters?type=APPLICATION_VOICE').respond(clusters);
    $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + uuids.orgId).respond(customerVoiceNorthAmerica);
    $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/clusters/' + uuids.clusterId + '/dialplans').respond(dialPlans);
    $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/clusters/' + uuids.clusterId + '/dialplandetails?dialplan=' + uuids.dialPlanIdNadp).respond(dialPlanDetailsNorthAmerica);

    controller = $controller('DidAddCtrl', {
      $scope: $scope,
      $state: $state,
      $stateParams: stateParams,
      $window: $window
    });
    controller.unsavedTokens = '+12145559999,+12145558888,+12145557777,+12145556666,+12145555555';
    controller.successCount = 0;
    controller.failCount = 0;
    controller.invalidcount = 0;
    controller.submitBtnStatus = false;
    $httpBackend.flush();
    $rootScope.$apply();
    $timeout.flush();

    spyOn(EmailService, 'emailNotifyTrialCustomer');
    spyOn(Notification, "notify");
    spyOn($window, 'open');
    spyOn($state, 'href').and.callThrough();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('launchCustomerPortal', function () {
    beforeEach(function () {
      controller.launchCustomerPortal();
    });
    it('should create proper url', function () {
      expect($state.href).toHaveBeenCalledWith('login_swap', {
        customerOrgId: trial.model.customerOrgId,
        customerOrgName: trial.model.customerName
      });
    });

    it('should call $window.open', function () {
      expect($window.open).toHaveBeenCalled();
    });
  });

  describe('DidAddCtrl controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined();
    });

    describe('after initialization', function () {
      it('should have checkForInvalidTokens method', function () {
        expect(controller.checkForInvalidTokens).toBeDefined();
      });

      it('should have tokenmethods object', function () {
        expect(controller.tokenmethods).toBeDefined();
      });

      describe('tokenmethods.createtoken function', function () {
        it('should exist', function () {
          expect(controller.tokenmethods.createtoken).toBeDefined();
        });

        it('should format the token properly and add a +1 to the number +1 (123) 456-7890', function () {
          var element = {
            attrs: {
              value: '2145556789',
              label: '2145556789'
            }
          };
          controller.tokenmethods.createtoken(element);
          expect(element.attrs.value).toEqual('+12145556789');
          expect(element.attrs.label).toEqual('(214) 555-6789');
        });

        it('should not format the token if an invalid number', function () {
          var element = {
            attrs: {
              value: '111 222 3333',
              label: '111 222 3333'
            }
          };
          controller.tokenmethods.createtoken(element);
          expect(element.attrs.value).toEqual('1112223333');
          expect(element.attrs.label).toEqual('111 222 3333');
        });
      });

      describe('tokenmethods.createdtoken function', function () {
        it('should exist', function () {
          expect(controller.tokenmethods.createdtoken).toBeDefined();
        });

        it('should increment invalidcount when an invalid DID is passed in', function () {
          var element = {
            attrs: {
              value: '51234DUDE567890',
              label: '51234DUDE567890'
            }
          };
          controller.tokenmethods.createdtoken(element);
          expect(controller.invalidcount).toBeGreaterThan(0);
        });

        it('should disable the submit button if duplicate records are found', function () {
          var element = {
            attrs: {
              value: '+12145556789',
              label: '+12145556789'
            }
          };
          controller.tokenmethods.createdtoken(element);
          expect(controller.submitBtnStatus).toBeTruthy();
          controller.tokenmethods.createdtoken(element);
          expect(controller.submitBtnStatus).toBeFalsy();

        });
      });

      describe('submit function', function () {
        it('should exist', function () {
          expect(controller.submit).toBeDefined();
        });

        describe('Added & Deleted DIDs', function () {
          beforeEach(function () {
            $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools', {
              'pattern': '+12145559999'
            }).respond(201);
            $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools', {
              'pattern': '+12145558888'
            }).respond(201);
            $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools', {
              'pattern': '+12145557777'
            }).respond(201);
            $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools', {
              'pattern': '+12145556666'
            }).respond(201);
            $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools', {
              'pattern': '+12145555555'
            }).respond(201);
            $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/12145559991-id')
              .respond(204);
            $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/12145558881-id')
              .respond(204);
            controller.confirmSubmit();
            controller.submit();
            $httpBackend.flush();
          });

          it('should have a newCount of 5', function () {
            expect(controller.addedCount).toEqual(5);
          });

          it('should have a deleteCount of 2', function () {
            expect(controller.deletedCount).toEqual(2);
          });

          it('should have a existCount of 0', function () {
            expect(controller.unchangedCount).toEqual(0);
          });

        });

        describe('Edited DIDs', function () {
          beforeEach(function () {
            controller.unsavedTokens = '+12145559991,+12145558888';
            $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools', {
              'pattern': '+12145558888'
            }).respond(201);
            $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/12145558881-id').respond(204);
            controller.confirmSubmit();
            controller.submit();
            $httpBackend.flush();
          });

          it('should have a newCount of 1', function () {
            expect(controller.addedCount).toEqual(1);
          });

          it('should have a deleteCount of 1', function () {
            expect(controller.deletedCount).toEqual(1);
          });

          it('should have a existCount of 1', function () {
            expect(controller.unchangedCount).toEqual(1);
          });

        });

        describe('Deleted DIDs', function () {
          beforeEach(function () {
            controller.unsavedTokens = '+12145559991';
            $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/12145558881-id').respond(204);
            controller.confirmSubmit();
            controller.submit();
            $httpBackend.flush();
          });

          it('should have a newCount of 0', function () {
            expect(controller.addedCount).toEqual(0);
          });

          it('should have a deleteCount of 1', function () {
            expect(controller.deletedCount).toEqual(1);
          });

          it('should have a existCount of 1', function () {
            expect(controller.unchangedCount).toEqual(1);
          });

        });

      });

      describe('sendEmail function', function () {
        it('should exist', function () {
          expect(controller.sendEmail).toBeDefined();
        });

        it('should send email and report success notification', function () {
          $httpBackend.whenPOST(HuronConfig.getEmailUrl() + '/email/didadd').respond(200);
          controller.sendEmail();
          $httpBackend.flush();
          expect(Notification.notify.calls.count()).toEqual(1);
        });

        it('should report error notification when email cannot be sent', function () {
          $httpBackend.whenPOST(HuronConfig.getEmailUrl() + '/email/didadd').respond(500);
          controller.sendEmail();
          $httpBackend.flush();
          expect(Notification.notify.calls.count()).toEqual(1);
        });
      });

      describe('emailNotifyTrialCustomer function with undefined trial', function () {
        beforeEach(function () {
          $scope.trial = undefined;
        });

        it('should exist', function () {
          expect(controller.emailNotifyTrialCustomer).toBeDefined();
        });

        it('should not exist', function () {
          expect($scope.trial).not.toBeDefined();
        });

        it('should report error notification when email cannot be sent', function () {
          controller.emailNotifyTrialCustomer();
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
        });
      });

      describe('emailNotifyTrialCustomer success function', function () {
        beforeEach(function () {
          EmailService.emailNotifyTrialCustomer.and.returnValue($q.when());
        });

        it('should exist', function () {
          expect(controller.emailNotifyTrialCustomer).toBeDefined();
        });

        it('should send email and report success notification', function () {

          controller.emailNotifyTrialCustomer();
          $scope.$apply();
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
        });
      });

      describe('emailNotifyTrialCustomer failure function', function () {
        beforeEach(function () {
          EmailService.emailNotifyTrialCustomer.and.returnValue($q.reject());
        });

        it('should exist', function () {
          expect(controller.emailNotifyTrialCustomer).toBeDefined();
        });

        it('should report error notification when email cannot be sent', function () {
          controller.emailNotifyTrialCustomer();
          $scope.$apply();
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
        });
      });

    });
  });
});