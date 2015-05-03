'use strict';

describe('Controller: GenerateActivationCodeCtrl', function () {
  var controller, $scope, $state, $httpBackend, HuronConfig, ActivationCodeEmailService, Notification;

  beforeEach(module('Huron'));

  var OtpService = {
    getQrCodeUrl: sinon.stub(),
    generateOtp: sinon.stub().fulfills(getJSONFixture('huron/json/device/otps/0001000200030004.json'))
  };

  var stateParams = {
    currentUser: {
      userName: 'jeffisawesome@awesomedude.com'
    },
    activationCode: 'new'
  };

  beforeEach(inject(function (Notification) {
    sinon.spy(Notification, "notify");
  }));

  beforeEach(inject(function ($rootScope, $controller, _$state_, _$httpBackend_, _HuronConfig_, _ActivationCodeEmailService_, _Notification_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    $httpBackend = _$httpBackend_;
    Notification = _Notification_;
    HuronConfig = _HuronConfig_;
    ActivationCodeEmailService = _ActivationCodeEmailService_;

    $state.modal = jasmine.createSpyObj('modal', ['close']);

    controller = $controller('GenerateActivationCodeCtrl', {
      $scope: $scope,
      $state: $state,
      $stateParams: stateParams,
      OtpService: OtpService
    });
    controller.showEmail = false;
    $rootScope.$apply();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('GenerateActivationCodeCtrl controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined();
    });

    describe('after activate', function () {
      it('should have an otp object defined', function () {
        expect(controller.otp).toBeDefined();
      });

      describe('activateEmail function', function () {
        it('should exist', function () {
          expect(controller.activateEmail).toBeDefined();
        });

        it('should set vm.showEmail = true when called', function () {
          controller.activateEmail();
          expect(controller.showEmail).toEqual(true);
        });
      });

      describe('clipboardFallback function', function () {
        it('should exist', function () {
          expect(controller.clipboardFallback).toBeDefined();
        });
      });

      describe('sendActivationCodeEmail function', function () {
        it('should exist', function () {
          expect(controller.sendActivationCodeEmail).toBeDefined();
        });

        it('should send email and notify success', function () {
          $httpBackend.whenPOST(HuronConfig.getEmailUrl() + '/email/activationcode').respond(200);
          controller.sendActivationCodeEmail();
          $httpBackend.flush();
          expect(Notification.notify.calledWith(['generateActivationCodeModal.emailSuccess'], 'success')).toBe(true);
          expect($state.modal.close).toHaveBeenCalled();
        });

        it('should try to send email and notify error', function () {
          $httpBackend.whenPOST(HuronConfig.getEmailUrl() + '/email/activationcode').respond(500);
          controller.sendActivationCodeEmail();
          $httpBackend.flush();
          expect(Notification.notify.calledOnce).toBe(true);
          expect($state.modal.close).not.toHaveBeenCalled();
        });
      });

    });
  });

});
