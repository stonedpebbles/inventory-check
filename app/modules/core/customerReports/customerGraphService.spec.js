'use strict';

describe('Service: Customer Graph Service', function () {
  var CustomerGraphService;
  var activeUsersChart, avgRoomsChart, filesSharedChart, mediaChart;
  var validateService = {
    validate: function () {}
  };

  var dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  var dummyActiveUserData = angular.copy(dummyData.activeUser.four);
  var dummyAvgRoomsData = angular.copy(dummyData.avgRooms.one);
  var dummyFilesSharedData = angular.copy(dummyData.filesShared.one);
  var dummyMediaData = angular.copy(dummyData.mediaQuality.one);

  beforeEach(module('Core'));

  beforeEach(inject(function (_CustomerGraphService_) {
    CustomerGraphService = _CustomerGraphService_;

    spyOn(validateService, 'validate');
  }));

  it('should exist', function () {
    expect(CustomerGraphService).toBeDefined();
  });

  describe('Active Users graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': dummyActiveUserData,
        validateData: validateService.validate
      });
      activeUsersChart = null;
      activeUsersChart = CustomerGraphService.setActiveUsersGraph(dummyActiveUserData, activeUsersChart);
    });

    it('should have created a graph when setActiveUsersGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should update graph when setActiveUsersGraph is called a second time', function () {
      CustomerGraphService.setActiveUsersGraph(dummyActiveUserData, activeUsersChart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Total Rooms graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': dummyAvgRoomsData,
        validateData: validateService.validate
      });
      avgRoomsChart = null;
      avgRoomsChart = CustomerGraphService.setAvgRoomsGraph(dummyAvgRoomsData, avgRoomsChart);
    });

    it('should have created a graph when setAvgRoomsGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should update graph when setAvgRoomsGraph is called a second time', function () {
      CustomerGraphService.setAvgRoomsGraph(dummyAvgRoomsData, avgRoomsChart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Files Shared graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': dummyFilesSharedData,
        validateData: validateService.validate
      });
      filesSharedChart = null;
      filesSharedChart = CustomerGraphService.setFilesSharedGraph(dummyFilesSharedData, filesSharedChart);
    });

    it('should have created a graph when setFilesSharedGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should update graph when setFilesSharedGraph is called a second time', function () {
      CustomerGraphService.setFilesSharedGraph(dummyFilesSharedData, filesSharedChart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Media Quality graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': dummyMediaData,
        validateData: validateService.validate
      });
      mediaChart = null;
      mediaChart = CustomerGraphService.setMediaQualityGraph(dummyMediaData, mediaChart);
    });

    it('should have created a graph when setMediaQualityGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should update graph when setMediaQualityGraph is called a second time', function () {
      CustomerGraphService.setMediaQualityGraph(dummyMediaData, mediaChart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });
});
