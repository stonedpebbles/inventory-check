(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('FusionResourceListController', FusionResourceListController);

  /* @ngInject */
  function FusionResourceListController($filter, $state, hasFeatureToggle, FusionClusterService, XhrNotificationService) {
    if (!hasFeatureToggle) {
      // show a white page…
      return;
    }

    var vm = this;
    var clustersCache = [];

    vm.loading = true;
    vm.activeFilter = 'all';
    vm.displayedClusters = [];
    vm.placeholder = {
      name: 'All',
      filterValue: 'all',
      count: 0
    };
    vm.filters = [{
      name: 'Expressway',
      filterValue: 'expressway',
      count: 0,
    }, {
      name: 'Non-Expressway',
      filterValue: 'non-expressway',
      count: 0,
    }];
    vm.countHosts = countHosts;
    vm.setFilter = setFilter;
    vm.searchData = searchData;
    vm.openService = openService;

    loadClusters();

    function loadClusters() {
      FusionClusterService.getAll()
        .then(function (clusters) {
          clustersCache = clusters;
          updateFilters();
          vm.displayedClusters = clusters;
        }, XhrNotificationService.notify)
        .finally(function () {
          vm.loading = false;
        });
    }

    function countHosts(cluster) {
      return _.chain(cluster.connectors)
        .map('hostname')
        .uniq()
        .size()
        .value();
    }

    function updateFilters() {
      var expressWayClusters = _.filter(clustersCache, isExpresswayCluster);
      vm.placeholder.count = clustersCache.length;
      vm.filters[0].count = expressWayClusters.length;
      vm.filters[1].count = clustersCache.length - expressWayClusters.length;
    }

    function isExpresswayCluster(cluster) {
      return _.some(cluster.connectors, {
        connectorType: 'c_mgmt'
      });
    }

    function setFilter(filter) {
      vm.activeFilter = filter.filterValue || 'all';
      if (filter.filterValue === 'expressway') {
        vm.displayedClusters = _.filter(clustersCache, isExpresswayCluster);
      } else if (filter.filterValue === 'non-expressway') {
        vm.displayedClusters = _.filter(clustersCache, !isExpresswayCluster);
      } else {
        vm.displayedClusters = clustersCache;
      }
    }

    function searchData(searchStr) {
      if (searchStr === '') {
        vm.displayedClusters = clustersCache;
      } else {
        // Filter on the cluster name only
        vm.displayedClusters = $filter('filter')(clustersCache, {
          name: searchStr
        });
      }
    }

    function openService(serviceId) {
      if (serviceId === 'squared-fusion-uc') {
        $state.go('call-service.list');
      } else if (serviceId === 'squared-fusion-cal') {
        $state.go('calendar-service.list');
      }
    }
  }
})();
