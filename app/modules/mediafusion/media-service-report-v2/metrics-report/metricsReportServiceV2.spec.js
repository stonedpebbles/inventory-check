'use strict';

describe('Service: Metrics Reports Service V2', function () {
  var $httpBackend, MetricsReportServiceV2, Notification;
  var callVolumeUrl, UtilizationUrl, clusterAvailabilityUrl, totalCallsCard, availabilityCard;

  var callVolumeData = getJSONFixture('mediafusion/json/metrics-graph-report/callVolumeData.json');
  var callVolume = callVolumeData.callvolume;
  var callVolumeGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/callVolumeGraphData.json');
  var responsedata = callVolumeGraphData.graphData;
  var UtilizationData = getJSONFixture('mediafusion/json/metrics-graph-report/UtilizationData.json');
  var utilizationdata = UtilizationData.utilization[0];
  var utilizationGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/UtilizationGraphData.json');
  var utilizationresponse = utilizationGraphData.graphData;
  var utilizationgraph = utilizationGraphData.graphs;
  var clusterAvailabilityData = getJSONFixture('mediafusion/json/metrics-graph-report/clusterAvailabilityData.json');
  var clusterAvailability = clusterAvailabilityData.clusteravailability;
  var clusterAvailabilityGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/clusterAvailabilityGraphData.json');
  var clusteravailabilityresponse = clusterAvailabilityGraphData.graphData;
  var totalCallsCardData = getJSONFixture('mediafusion/json/metrics-graph-report/totalCallsCardData.json');
  var totalcallsdata = totalCallsCardData.totolcalls;
  var availabilityCardData = getJSONFixture('mediafusion/json/metrics-graph-report/availabilityCardData.json');
  var availabilitydata = availabilityCardData.availability;

  var allClusters = 'mediaFusion.metrics.allclusters';
  var sampleClusters = 'mediaFusion.metrics.sampleclusters';

  beforeEach(angular.mock.module('Mediafusion'));

  var timeFilter = {
    value: 0
  };

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };
  var error = {
    message: 'error',
    data: {
      trackingId: "id"
    }
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _MetricsReportServiceV2_, _Notification_, UrlConfig) {
    $httpBackend = _$httpBackend_;
    MetricsReportServiceV2 = _MetricsReportServiceV2_;
    Notification = _Notification_;

    spyOn(Notification, 'notify');

    var baseUrl = UrlConfig.getAthenaServiceUrl() + '/organizations/' + Authinfo.getOrgId();
    callVolumeUrl = baseUrl + '/call_volume/?relativeTime=1d';
    UtilizationUrl = baseUrl + '/utilization/?relativeTime=1d';
    clusterAvailabilityUrl = baseUrl + '/clusters_availability/?relativeTime=1d';
    totalCallsCard = baseUrl + '/total_calls/?relativeTime=1d';
    availabilityCard = baseUrl + '/agg_availability/?relativeTime=1d';

  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function () {
    expect(MetricsReportServiceV2).toBeDefined();
  });

  it('getCallVolumeData should exist', function () {
    expect(MetricsReportServiceV2.getCallVolumeData).toBeDefined();
  });

  it('should exist', function () {
    expect(MetricsReportServiceV2.getAvailabilityData).toBeDefined();
  });

  describe('Call Volume Graph Data', function () {
    it('should get call volume data', function () {
      $httpBackend.whenGET(callVolumeUrl).respond(callVolume);

      MetricsReportServiceV2.getCallVolumeData(timeFilter, allClusters).then(function (response) {
        expect(response).toEqual({
          graphData: responsedata
        });
      });

      $httpBackend.flush();
    });

    it('should notify an error for call volume data failure', function () {
      $httpBackend.whenGET(callVolumeUrl).respond(500, error);

      MetricsReportServiceV2.getCallVolumeData(timeFilter, allClusters).then(function (response) {
        expect(response).toEqual({
          graphData: []
        });
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });

  describe('Percentage of CPU utilization', function () {
    xit('should get percentage utilization data', function () {
      $httpBackend.whenGET(UtilizationUrl).respond(utilizationdata);

      MetricsReportServiceV2.getUtilizationData(timeFilter, allClusters).then(function (response) {
        expect(response).toEqual({
          graphData: utilizationresponse,
          graphs: utilizationgraph
        });
      });

      $httpBackend.flush();
    });

    it('should notify an error for percentage utilization failure', function () {
      $httpBackend.whenGET(UtilizationUrl).respond(500, error);

      MetricsReportServiceV2.getUtilizationData(timeFilter, allClusters).then(function (response) {
        expect(response).toEqual({
          graphData: [],
          graphs: []
        });
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });

  describe('Cluster Availability Data', function () {
    it('should get cluster availability data', function () {
      $httpBackend.whenGET(clusterAvailabilityUrl).respond(clusterAvailability);

      MetricsReportServiceV2.getAvailabilityData(timeFilter, allClusters).then(function (response) {
        expect(response.data).toEqual(clusteravailabilityresponse);
      });

      $httpBackend.flush();
    });

    it('should notify an error for cluster availability data failure', function () {
      $httpBackend.whenGET(clusterAvailabilityUrl).respond(500, error);

      MetricsReportServiceV2.getAvailabilityData(timeFilter, allClusters).then(function (response) {
        expect(response).toEqual([]);
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });

  describe('Total Number of calls', function () {
    it('should get total number of calls', function () {
      $httpBackend.whenGET(totalCallsCard).respond(totalcallsdata);

      MetricsReportServiceV2.getTotalCallsData(timeFilter, allClusters).then(function (response) {
        expect(response.data).toEqual(totalcallsdata);
      });

      $httpBackend.flush();
    });

    it('should notify an error for total number of calls failure', function () {
      $httpBackend.when('GET', /^\w+.*/).respond(500, error);

      MetricsReportServiceV2.getTotalCallsData(timeFilter, sampleClusters).then(function (response) {
        expect(response).toEqual([]);
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });

  describe('Cluster Availability Data on the Card', function () {
    it('should get cluster availability percentage', function () {
      $httpBackend.whenGET(availabilityCard).respond(availabilitydata);

      MetricsReportServiceV2.getClusterAvailabilityData(timeFilter, allClusters).then(function (response) {
        expect(response.data).toEqual(availabilitydata);
      });

      $httpBackend.flush();
    });

    it('should notify an error for cluster availability percentage failure', function () {
      $httpBackend.whenGET(availabilityCard).respond(500, error);

      MetricsReportServiceV2.getClusterAvailabilityData(timeFilter, allClusters).then(function (response) {
        expect(response).toEqual([]);
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });

});
