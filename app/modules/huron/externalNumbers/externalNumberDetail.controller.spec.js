'use strict';

describe('Controller: ExternalNumberDetailCtrl', function () {
  var controller, $controller, $scope, $stateParams, $q, ModalService, ExternalNumberService, Notification;

  var externalNumbers, modalDefer;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$stateParams_, _$q_, _ModalService_, _ExternalNumberService_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    ModalService = _ModalService_;
    ExternalNumberService = _ExternalNumberService_;
    Notification = _Notification_;
    $q = _$q_;

    $stateParams.currentCustomer = {
      customerOrgId: '5555-6666'
    };

    externalNumbers = [{
      'pattern': '123'
    }, {
      'pattern': '456'
    }];

    modalDefer = $q.defer();

    spyOn(ExternalNumberService, 'getAllNumbers').and.returnValue(externalNumbers);
    spyOn(ExternalNumberService, 'refreshNumbers').and.returnValue($q.when());
    spyOn(ExternalNumberService, 'deleteNumber').and.returnValue($q.when());
    spyOn(ModalService, 'open').and.returnValue({
      result: modalDefer.promise
    });
    spyOn(Notification, 'success');
    spyOn(Notification, 'errorResponse');

    controller = $controller('ExternalNumberDetailCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }));

  it('should load all the phone numbers', function () {
    expect(controller.allNumbers).toEqual(externalNumbers);
  });

  it('should refresh list of phone numbers', function () {
    var newNumbers = externalNumbers.concat([{
      'pattern': '789'
    }, {
      'pattern': '000'
    }]);
    ExternalNumberService.getAllNumbers.and.returnValue(newNumbers);
    controller.listPhoneNumbers();
    $scope.$apply();
    expect(controller.allNumbers.length).toEqual(4);
  });

  it('should show no numbers on error', function () {
    ExternalNumberService.refreshNumbers.and.returnValue($q.reject());
    ExternalNumberService.getAllNumbers.and.returnValue([]);
    controller.listPhoneNumbers();
    $scope.$apply();
    expect(Notification.errorResponse).toHaveBeenCalled();
    expect(controller.allNumbers).toEqual([]);
  });

  it('should show no numbers if no customer found', function () {
    ExternalNumberService.getAllNumbers.and.callThrough();
    delete $stateParams.currentCustomer.customerOrgId;
    controller = $controller('ExternalNumberDetailCtrl', {
      $scope: $scope
    });
    $scope.$apply();
    expect(controller.allNumbers).toEqual([]);
  });

  it('should delete number on modal close', function () {
    controller.deleteNumber(externalNumbers[0]);
    modalDefer.resolve();
    $scope.$apply();

    expect(controller.allNumbers.length).toEqual(1);
    expect(Notification.success).toHaveBeenCalled();
  });

  it('should notify error when delete fails', function () {
    ExternalNumberService.deleteNumber.and.returnValue($q.reject());
    controller.deleteNumber(externalNumbers[0]);
    modalDefer.resolve();
    $scope.$apply();

    expect(controller.allNumbers.length).toEqual(2);
    expect(Notification.errorResponse).toHaveBeenCalled();
  });

  it('should not delete number on modal dismiss', function () {
    controller.deleteNumber(externalNumbers[0]);
    modalDefer.reject();
    $scope.$apply();

    expect(controller.allNumbers.length).toEqual(2);
    expect(Notification.success).not.toHaveBeenCalled();
  });

});