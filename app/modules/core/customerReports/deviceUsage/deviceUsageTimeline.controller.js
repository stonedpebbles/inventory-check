(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageTimelineCtrl', DeviceUsageTimelineCtrl);

  /* @ngInject */
  function DeviceUsageTimelineCtrl($state, $scope, DeviceUsageTimelineService, deviceUsageFeatureToggle) {
    var vm = this;
    var amChart;
    var apiToUse = 'mock';

    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $state.go('login');
    }

    vm.dateRanges = [{
      label: 'Last Week',
      value: 'last_week',
      name: 'dateRange',
      id: 'week'
    }, {
      label: 'Last Month',
      value: 'last_month',
      name: 'dateRange',
      id: 'month'
    }, {
      label: 'Last 3 Months',
      value: 'last_3_months',
      name: 'dateRange',
      id: 'last_3_months'
    }];

    vm.dateRange = 'last_week';

    //vm.showDevices = false;
    //var lastDataPointIndex = null;

    vm.rangeChange = function () {
      switch (vm.dateRange) {
        case 'last_week':
          loadLastWeek();
          break;
        case 'last_month':
          loadLastMonth();
          break;
        case 'last_3_months':
          loadLast3Months();
          break;
        default:
          loadLastWeek();
      }
    };

    init();

    function init() {
      DeviceUsageTimelineService.getDataForLastWeek(apiToUse).then(function (data) {
        var chart = DeviceUsageTimelineService.getLineChart();
        chart.listeners = [
        { event: 'rollOverGraphItem', method: rollOverGraphItem },
        { event: 'rollOutGraphItem', method: rollOutGraphItem },
        //{ event: 'clickGraphItem', method: clickGraphItem }
        ];
        chart.dataProvider = data;
        amChart = AmCharts.makeChart('device-usage-timeline-chart', chart);
        _.each(amChart.graphs, function (graph) {
          graph.balloonFunction = renderBalloon;
        });

      });
    }

    function loadLastWeek() {
      DeviceUsageTimelineService.getDataForLastWeek(apiToUse).then(function (data) {
        amChart.dataProvider = data;
        amChart.validateData();
        vm.showDevices = false;
      });
    }

    function loadLastMonth() {
      DeviceUsageTimelineService.getDataForLastMonth(apiToUse).then(function (data) {
        amChart.dataProvider = data;
        amChart.validateData();
        vm.showDevices = false;
      });
    }

    function loadLast3Months() {
      DeviceUsageTimelineService.getDataForLastMonths(3, 'day', apiToUse).then(function (data) {
        amChart.dataProvider = data;
        amChart.validateData();
        vm.showDevices = false;
      });
    }

    function rollOverGraphItem(event) {
      vm.additionalInfo = true;
      vm.dayData = event.item.dataContext;
      $scope.$apply();
    }

    function rollOutGraphItem() {
      vm.additionalInfo = false;
      $scope.$apply();
    }

    // function clickGraphItem(event) {
    //   if (lastDataPointIndex === event.index) {
    //     vm.showDevices = !vm.showDevices;
    //   } else {
    //     lastDataPointIndex = event.index;
    //     vm.devices = event.item.dataContext.devices;
    //     vm.dateForDevices = event.item.dataContext.time;
    //     vm.showDevices = true;
    //   }
    //   $scope.$apply();
    // }

    function renderBalloon(graphDataItem) {
      var text = '<div><h5>Call Duration: ' + graphDataItem.dataContext.totalDuration + '</h5>';
      text = text + 'Call Count:  ' + graphDataItem.dataContext.callCount + ' <br/> ';
      text = text + 'Paired Count: ' + graphDataItem.dataContext.pairedCount + '<br/>';
      //text = text + 'Devices: ' + graphDataItem.dataContext.devices.length + '</div>';
      return text;
    }

  }

})();
