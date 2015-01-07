describe('Hercules: ConnectorController', function() {
  beforeEach(module('wx2AdminWebClientApp'));

  var $scope = {};
  var controller, notification, service;

  beforeEach(inject(function(_$controller_){
    notification = {
      notify: sinon.stub()
    }
    service = {
      fetch: sinon.stub(),
      services: sinon.stub(),
      upgradeSoftware: sinon.stub()
    }
    controller = _$controller_('ConnectorCtrl', {
      $scope: $scope,
      ConnectorService: service,
      Notification: notification
    });
  }));

  it('initializes scope.loading and fetches initial data', function() {
    expect($scope.loading).toEqual(true);
    expect(service.fetch.calledOnce).toEqual(true);

    service.fetch.callArgWith(0, null, []);
    expect($scope.loading).toEqual(false);
    expect(notification.notify.callCount).toEqual(0);
  });

  it('logs an error if server returns an error', function() {
    service.fetch.callArgWith(0, 'err', []);
    expect(notification.notify.calledOnce).toEqual(true);
  });

  it('reloads data on reload', function() {
    service.fetch.callArgWith(0, null, []);

    $scope.reload();
    expect($scope.loading).toEqual(true);
    expect(service.fetch.calledTwice).toBe(true);
  });

  it('upgrades software', function() {
    expect(service.upgradeSoftware.callCount).toBe(0);

    $scope.upgradeSoftware('clusterid', 'servicetype');

    expect(service.upgradeSoftware.calledOnce).toBe(true);
    expect(service.upgradeSoftware.args[0][0].clusterId).toBe('clusterid');
    expect(service.upgradeSoftware.args[0][0].serviceType).toBe('servicetype');
  });

});