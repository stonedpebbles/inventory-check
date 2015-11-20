'use strict';

describe('TrackingIDInterceptor', function () {
  beforeEach(module('Core'));

  var TrackingIDInterceptor;
  var exposeHeaders = 'Access-Control-Expose-Headers';
  var trackingId = 'TrackingID';

  beforeEach(inject(function (_TrackingIDInterceptor_) {
    TrackingIDInterceptor = _TrackingIDInterceptor_;
  }));

  it('should add an access-control-expose-header if doesn\'t exist', function () {
    var response = TrackingIDInterceptor.request({
      url: 'http://cmi.huron-dev.com/some/url',
      headers: {}
    });

    expect(response.headers[exposeHeaders]).toContain(trackingId);
  });

  it('should add an access-control-expose-header if another header already exists', function () {
    var response = TrackingIDInterceptor.request({
      url: 'http://cmi.huron-dev.com/some/url',
      headers: {
        'Access-Control-Expose-Headers': 'Location'
      }
    });

    expect(response.headers[exposeHeaders]).toContain(trackingId);
    expect(response.headers[exposeHeaders]).toContain('Location');
  });

  it('should not add an access-control-expose-header if another domain', function () {
    var response = TrackingIDInterceptor.request({
      url: 'http://atlas-integration.wbx2.com/some/url',
      headers: {
        'Access-Control-Expose-Headers': 'Location'
      }
    });

    expect(response.headers[exposeHeaders]).not.toContain(trackingId);
    expect(response.headers[exposeHeaders]).toContain('Location');
  });

});