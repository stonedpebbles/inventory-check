import {
  IEndpointData,
  ITimespan,
} from './partnerReportInterfaces';

describe('Service: Report Service', () => {
  const activeUserData = getJSONFixture('core/json/partnerReports/activeUserData.json');
  const callMetricsData = getJSONFixture('core/json/partnerReports/callMetricsData.json');
  const customerData = getJSONFixture('core/json/partnerReports/customerResponse.json');
  const defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
  const mediaQualityData = getJSONFixture('core/json/partnerReports/mediaQualityData.json');
  const registeredEndpointsData = getJSONFixture('core/json/partnerReports/registeredEndpointData.json');
  const timeFilter: Array<ITimespan> = _.cloneDeep(defaults.timeFilter[0]);
  const rejectError = {
    status: 500,
  };

  let updateDates = (data: any, format: boolean) => {
    for (let i = data.length - 1; i >= 0; i--) {
      if (format) {
        data[i].date = moment().subtract(data.length - i, defaults.DAY).format(defaults.dayFormat);
      } else {
        data[i].date = moment().subtract(data.length - i, defaults.DAY).format();
      }
    }
    return data;
  };

  beforeEach(function () {
    this.initModules('Core', 'Huron');
    this.injectDependencies('$httpBackend', '$q', 'CommonReportService', 'ReportService');

    spyOn(this.CommonReportService, 'returnErrorCheck').and.callFake((error, message, response) => {
      expect(error).toEqual(rejectError);
      expect(message).not.toBe(undefined);
      return response;
    });
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function () {
    expect(this.ReportService).toBeDefined();
    expect(this.CommonReportService).toBeDefined();
  });

  describe('Active User Services', function () {
    beforeEach(function () {
      let activeUserDetailedAPI = _.cloneDeep(activeUserData.detailedAPI);
      activeUserDetailedAPI.data[0].data = updateDates(activeUserDetailedAPI.data[0].data, false);
      activeUserDetailedAPI.data[1].data = updateDates(activeUserDetailedAPI.data[1].data, false);

      spyOn(this.CommonReportService, 'getPartnerReport').and.returnValue(this.$q.when({
        data: activeUserDetailedAPI,
      }));
    });

    it('should getOverallActiveUserData', function () {
      this.ReportService.getOverallActiveUserData(timeFilter).then(function (response) {
        expect(response).toBe(undefined);
      });
    });

    it('should getActiveUserData for an existing customer', function () {
      let popData = _.cloneDeep(activeUserData.activePopResponse);
      _.forEach(popData, (data) => {
        data.color = undefined;
      });

      this.ReportService.getActiveUserData(customerData.customerOptions, timeFilter).then(function (response) {
        expect(response).toEqual({
          graphData: updateDates(_.cloneDeep(activeUserData.detailedResponse), true),
          popData: popData,
          isActiveUsers: true,
        });
      });
    });
  });

  describe('Active User Services Error:', function () {
    beforeEach(function () {
      spyOn(this.CommonReportService, 'getPartnerReport').and.returnValue(this.$q.reject(rejectError));
    });

    it('should notify an error for getActiveUserData and return empty data', function () {
      let popData = _.cloneDeep(activeUserData.activePopResponse);
      _.forEach(popData, (data) => {
        data.percentage = 0;
        data.overallPopulation = 0;
        data.color = undefined;
      });

      this.ReportService.getActiveUserData(customerData.customerOptions, timeFilter).then(function (response) {
        expect(response).toEqual({
          graphData: [],
          popData: popData,
          isActiveUsers: false,
        });
      });
    });
  });

  describe('Most Active User Services', function () {
    it('should getActiveTableData for an existing customer', function () {
      spyOn(this.CommonReportService, 'getPartnerReportByReportType').and.returnValue(this.$q.when({
        data: _.cloneDeep(activeUserData.mostActiveAPI),
      }));
      this.ReportService.getActiveTableData(customerData.customerOptions, timeFilter).then(function (response) {
        expect(response.length).toEqual(activeUserData.mostActiveResponse.length);
        _.forEach(activeUserData.mostActiveResponse, (item) => {
          expect(response).toContain(item);
        });
      });
    });

    it('should notify an error for getActiveTableData and return empty', function () {
      spyOn(this.CommonReportService, 'getPartnerReportByReportType').and.returnValue(this.$q.reject(rejectError));
      this.ReportService.getActiveTableData(customerData.customerOptions, timeFilter).then(function (response) {
        expect(response).toEqual([]);
      });
    });
  });

  describe('Media Quality Services', function () {
    it('should get MediaQuality Metrics', function () {
      let mediaAPI = _.cloneDeep(mediaQualityData.mediaQualityAPI);
      mediaAPI.data[0].data[0].date = moment().subtract(1, 'day').format();
      mediaAPI.data[2].data[0].date = moment().subtract(3, 'day').format();
      let mediaQualityResponse = updateDates(_.cloneDeep(mediaQualityData.mediaQualityResponse), true);

      spyOn(this.CommonReportService, 'getPartnerReport').and.returnValue(this.$q.when({
        data: mediaAPI,
      }));
      this.ReportService.getMediaQualityMetrics(customerData.customerOptions, timeFilter).then(function (response) {
        expect(response).toEqual(mediaQualityResponse);
      });
    });

    it('should get empty array for GET failure', function () {
      spyOn(this.CommonReportService, 'getPartnerReport').and.returnValue(this.$q.reject(rejectError));
      this.ReportService.getMediaQualityMetrics(customerData.customerOptions, timeFilter).then(function (response) {
        expect(response).toEqual([]);
      });
    });
  });

  describe('Call Metrics Services', function () {
    it('should get Call Metrics', function () {
      spyOn(this.CommonReportService, 'getPartnerReport').and.returnValue(this.$q.when({
        data: _.cloneDeep(callMetricsData.callMetricsAPI),
      }));
      this.ReportService.getCallMetricsData(customerData.customerOptions, timeFilter).then(function (response) {
        expect(response).toEqual(callMetricsData.callMetricsResponse);
      });
    });

    it('should get empty array for GET failure', function () {
      spyOn(this.CommonReportService, 'getPartnerReport').and.returnValue(this.$q.reject(rejectError));
      this.ReportService.getCallMetricsData(customerData.customerOptions, timeFilter).then(function (data) {
        expect(data).toEqual(_.cloneDeep(callMetricsData.emptyArray));
      });
    });
  });

  describe('Registered Endpoint Service', function () {
    it('should get registered endpoints for a customer with positive response', function () {
      let endpointData: Array<Array<IEndpointData>> = _.cloneDeep(registeredEndpointsData.registeredEndpointResponse);
      _.forEach(endpointData, (data) => {
        data[0].splitClasses = undefined;
        data[2].splitClasses = undefined;
        data[3].splitClasses = undefined;
      });

      spyOn(this.CommonReportService, 'getPartnerReport').and.returnValue(this.$q.when({
        data: _.cloneDeep(registeredEndpointsData.registeredEndpointsAPI),
      }));
      this.ReportService.getRegisteredEndpoints(customerData.customerOptions, timeFilter).then(function (response) {
        expect(response).toEqual(endpointData);
      });
    });

    it('should return an empty array on error response', function () {
      spyOn(this.CommonReportService, 'getPartnerReport').and.returnValue(this.$q.reject(rejectError));
      this.ReportService.getRegisteredEndpoints(customerData.customerOptions, timeFilter).then(function (response) {
        expect(response).toEqual([]);
      });
    });
  });

  describe('Helper Services', function () {
    let managedOrgsUrl = 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/null/managedOrgs';

    it('getCustomerList should return a list of customers', function () {
      this.$httpBackend.whenGET(managedOrgsUrl).respond({
        organizations: _.cloneDeep(customerData.customerResponse),
      });
      this.ReportService.getCustomerList().then(function (list) {
        expect(list).toEqual(customerData.customerResponse);
      });
      this.$httpBackend.flush();
    });

    it('getCustomerList should flag an error when managedOrgs does not return data', function () {
      this.$httpBackend.whenGET(managedOrgsUrl).respond(500, {
        message: 'error',
      });
      this.ReportService.getCustomerList().then(function (list) {
        expect(list).toEqual([]);
      });
      this.$httpBackend.flush();
    });
  });
});