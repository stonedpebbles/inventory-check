(function () {
  'use strict';

  /* @ngInject */
  function DeleteClusterSettingControllerV2($q, cluster, $modalInstance, $filter, MediaClusterServiceV2, $state, $translate, Notification) {
    var vm = this;
    vm.selectPlaceholder = $translate.instant('mediaFusion.add-resource-dialog.cluster-placeholder');
    vm.options = [];
    vm.close = $modalInstance.close;
    vm.selectModel = {};
    vm.fillModel = {};
    vm.radioModel = '1';
    vm.checkboxModel = false;
    vm.isMove = true;
    vm.successCount = 0;
    vm.errorCount = 0;
    vm.failedHostMove = [];
    vm.failedToDelete = false;
    vm.hosts = '';
    vm.ngDisable = false;
    vm.canContinue = canContinue;

    vm.deleteAreYouSure = $translate.instant(
      'mediaFusion.deleteGroup.message', {
        groupName: cluster.name
      });

    MediaClusterServiceV2.getAll()
      .then(function (clusters) {
        vm.clusters = _.filter(clusters, { 'targetType': 'mf_mgmt' });
        _.each(vm.clusters, function (clust) {
          if (cluster.id != clust.id) {
            vm.options.push(clust.name);
          }
        });
        vm.options.sort();
      });

    MediaClusterServiceV2.get(cluster.id).then(function (response) {
      vm.cluster = response;
      vm.hosts = vm.cluster.connectors;
      vm.noOfHost = vm.hosts.length;
      for (var i = 0; i < vm.hosts.length; i++) {
        var key = vm.hosts[i].hostname;
        var value = vm.selectPlaceholder;
        vm.selectModel[key] = value;
        vm.fillModel[key] = false;
      }
    });

    vm.continue = function () {
      for (var i = 0; i < vm.hosts.length; i++) {
        var key = vm.hosts[i].hostname;
        vm.fillModel[key] = false;
        if (vm.selectModel[key] == vm.selectPlaceholder) {
          vm.fillModel[key] = true;
          vm.isMove = false;
        }
      }
      if (vm.isMove) {
        if (vm.hosts.length == 0) {
          deleteCluster();
          return;
        }
        moveNodesTocluster();
      }
      vm.isMove = true;
    };

    vm.deleteCluster = function () {
      //this is to deregister all host and delete cluster
      for (var i = 0; i < vm.hosts.length; i++) {
        defuseHost(vm.hosts[i]);
      }
    };

    function defuseHost(host) {
      MediaClusterServiceV2.defuseV2Connector(host.id).success(incrementSuccessDefuse(host)).error(incrementFailureCount(host));
    }

    function moveNodesTocluster() {
      var loopPromises = createCluster();
      var promise = $q.all(loopPromises);
      promise.then(function (response) {
        var clusterArray = _.compact(response);
        for (var i = 0; i < vm.hosts.length; i++) {
          var hostname = vm.hosts[i].hostname;
          var toClusterName = vm.selectModel[hostname];
          moveHost(hostname, toClusterName, clusterArray);
        }
      });
    }

    var recoverPromise = function () {
      return undefined;
    };

    function createCluster() {
      var loopPromises = [];
      var clusterListNames = [];
      for (var i = 0; i < vm.hosts.length; i++) {
        var hostname = vm.hosts[i].hostname;
        var toClusterName = vm.selectModel[hostname];
        var toCluster = $filter('filter')(vm.clusters, {
          'name': toClusterName
        }, true)[0];

        if (!_.includes(clusterListNames, toClusterName)) {
          if (!_.isUndefined(toCluster)) {
            var deferred = $q.defer();
            loopPromises.push(deferred.promise.catch(recoverPromise));
            var response = { 'data': toCluster };
            deferred.resolve(response);
          } else {
            var promise = MediaClusterServiceV2.createClusterV2(toClusterName, 'stable');
            loopPromises.push(promise.catch(recoverPromise));
          }
          clusterListNames.push(toClusterName);
        }
      }
      return loopPromises;
    }

    function moveHost(hostname, toClusterName, response) {
      var host;
      var fromCluster;
      var toCluster;

      toCluster = _.find(response, function (res) {
        return res.data.name === toClusterName;
      });

      host = $filter('filter')(vm.hosts, {
        'hostname': hostname
      }, true)[0];

      if (_.isUndefined(toCluster)) {
        vm.errorCount++;
        vm.failedHostMove.push(host.hostname);
        deleteCluster();
      } else {
        fromCluster = vm.cluster;
        MediaClusterServiceV2.moveV2Host(host.id, fromCluster.id, toCluster.data.id).success(incrementSuccessCount(host, toCluster)).error(incrementFailureCount(host));
      }
    }

    function incrementSuccessDefuse() {
      return function () {
        vm.successCount++;
        deleteCluster();
      };
    }

    function incrementSuccessCount(host, toCluster) {
      return function () {
        vm.successCount++;
        vm.successMove = $translate.instant('mediaFusion.clusters.movedTo', {
          nodeName: host.hostname,
          clusterName: toCluster.data.name
        });
        Notification.success(vm.successMove);
        deleteCluster();
      };
    }

    function incrementFailureCount(host) {
      return function () {
        vm.errorCount++;
        vm.failedHostMove.push(host.hostname);
        deleteCluster();
      };
    }

    function deleteCluster() {
      if (vm.successCount == vm.noOfHost) {
        MediaClusterServiceV2.deleteV2Cluster(vm.cluster.id).then(function () {
          vm.success = $translate.instant('mediaFusion.clusters.clusterdeleteSuccess', {
            clustername: vm.cluster.name
          });
          Notification.success(vm.success);
          $modalInstance.close();
          $state.go("media-service-v2.list");
        }, function (err) {
          vm.error = $translate.instant('mediaFusion.deleteGroup.errorMessage', {
            groupName: vm.cluster.name
          });
          Notification.errorWithTrackingId(err, vm.error);
        });
      } else if ((vm.successCount + vm.errorCount) == vm.noOfHost) {
        vm.failedToDelete = true;
        vm.ngDisable = true;
        var nodesString = '';
        _.forEach(vm.failedHostMove, function (value) {
          nodesString = value + ', ' + nodesString;
        });
        vm.unableToMoveNodes = $translate.instant(
          'mediaFusion.clusters.unabletomovenodes', {
            nodes: nodesString
          });
      }
    }
    function canContinue() {
      for (var i = 0; i < vm.hosts.length; i++) {
        var key = vm.hosts[i].hostname;
        if (vm.selectModel[key] == vm.selectPlaceholder || vm.selectModel[key] == '') {
          return false;
        }
      }
      return true;
    }
  }

  angular
    .module('Mediafusion')
    .controller('DeleteClusterSettingControllerV2', DeleteClusterSettingControllerV2);

}());
