'use strict';

/* global _ */

angular.module('Hercules')
  .service('DashboardAggregator', [
    function DashboardAggregator() {

      var createEmptyAggregate = function (services) {
        return {
          running: 0,
          needs_attention: 0,
          services: createEmptyServicesAggregate(services)
        };
      };

      var createEmptyServicesAggregate = function (services) {
        return _.reduce(services, function (serviceAggregate, service) {
          serviceAggregate[service.connector_type] = {
            name: service.display_name,
            type: service.connector_type,
            icon: service.icon_class,
            service_id: service.service_id,
            running: 0,
            needs_attention: 0,
            software_upgrades: 0
          };
          return serviceAggregate;
        }, {});
      };

      var aggregateServiceStatus = function (clusterAggregate, cluster) {
        _.each(cluster.services, function (service) {
          if (service.service_type != 'c_mgmt') {
            var allConnecorsDisabled = _.reduce(service.connectors, function (aggregateStatus, connector) {
              return aggregateStatus && connector.state == 'disabled';
            }, true);
            if (!allConnecorsDisabled) {
              var aggregateService = clusterAggregate.services[service.service_type];
              if (aggregateService) {
                if (service.needs_attention) {
                  aggregateService.needs_attention++;
                } else {
                  aggregateService.running++;
                }
                if (service.not_approved_package) {
                  aggregateService.software_upgrades++;
                }
              }
            }
          }
        });
        var allServicesDisabled = _.reduce(
          cluster.services,
          function (aggregateStatus, service) {
            return aggregateStatus && !service.running_hosts;
          },
          true
        );
        if (cluster.needs_attention) {
          clusterAggregate.needs_attention++;
        } else if (!allServicesDisabled) {
          clusterAggregate.running++;
        }
        return clusterAggregate;
      };

      return {
        aggregateServices: function (services, clusters) {
          return _.reduce(
            clusters,
            aggregateServiceStatus,
            createEmptyAggregate(services)
          );
        }
      };
    }
  ]);
