'use strict';

describe('Controller: NewTreatmentModalCtrl', function () {

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  var $scope;
  var modalFake = {
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss')
  };

  beforeEach(inject(function ($rootScope, $controller, $state) {
    $scope = $rootScope.$new();

    spyOn($state, 'go');

    $controller('NewTreatmentModalCtrl', {
      $scope: $scope,
      $modalInstance: modalFake
    });
  }));

  it("length of minutes should be 60.", function () {
    expect($scope.minutes.length).toEqual(60);
  });

  it("default value of minute should be 15.", function () {
    expect($scope.minute).toEqual('15');
  });

  it("cancel function call results in dismissing the Modal.", function () {
    $scope.cancel();
    expect(modalFake.dismiss).toHaveBeenCalledWith("cancel");
  });
});
