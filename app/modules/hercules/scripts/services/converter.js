'use strict';

angular.module('Hercules')
  .service('ConverterService', [
    function ConverterService() {

      var convertConnectors = function (data) {
        return _.map(data, function (connector) {
          var c = _.cloneDeep(connector);

          c.status = c.status || {};
          c.status.state = c.status.state || 'unknown';

          if (c.status.alarms && c.status.alarms.length) {
            c.status.state = 'error';
          }

          switch (c.status.state) {
          case 'running':
            c.status_class = 'success';
            break;
          case 'disabled':
          case 'not_configured':
            c.status_class = 'default';
            break;
          default:
            c.status_class = 'danger';
          }
          return c;
        });
      };

      var convertClusters = function (data) {
        var converted = _.map(data, function (origCluster) {
          var cluster = _.cloneDeep(origCluster);
          _.each(cluster.services, function (service) {
            service.running_hosts = 0;
            _.each(service.connectors, function (connector) {
              if ((connector.alarms && connector.alarms.length) || (connector.state != 'running' && connector.state != 'disabled')) {
                cluster.needs_attention = cluster.initially_open = true;
                service.needs_attention = true;
                service.is_disabled = false;
              }
              if (connector.state == 'disabled' && service.running_hosts == 0) {
                service.is_disabled = true;
              }
              if (connector.state == 'running') {
                service.is_disabled = false;
                service.running_hosts = ++service.running_hosts;
              }
            });
            if (cluster.provisioning_data && cluster.provisioning_data.not_approved_packages) {
              var not_approved_package = _.find(cluster.provisioning_data.not_approved_packages, function (pkg) {
                return pkg.service.service_type == service.service_type;
              });
              if (not_approved_package) {
                service.not_approved_package = not_approved_package;
              }
            }
          });
          cluster.services = _.sortBy(cluster.services, function (obj) {
            if (obj.needs_attention) return 1;
            if (obj.is_disabled) return 3;
            return 2;
          });
          return cluster;
        });
        return _.sortBy(converted, function (obj) {
          return !obj.needs_attention;
        });
      };

      return {
        convertClusters: convertClusters,
        convertConnectors: convertConnectors
      };
    }
  ]);