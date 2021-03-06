(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('ServiceStateChecker', ServiceStateChecker);

  /*@ngInject*/
  function ServiceStateChecker(NotificationService, ClusterService, USSService, ServiceDescriptor, Authinfo, FeatureToggleService, Orgservice, DomainManagementService) {
    var vm = this;
    vm.isSipUriAcknowledged = false;
    vm.hasSipUriDomainConfigured = false;
    vm.hasVerifiedDomains = false;
    var allExpresswayServices = ['squared-fusion-uc', 'squared-fusion-ec', 'squared-fusion-cal', 'squared-fusion-mgmt'];

    function checkState(connectorType, serviceId) {
      if (checkIfFusePerformed()) {
        if (checkIfConnectorsConfigured(connectorType)) {
          checkDomainVerified(serviceId);
          checkUserStatuses(serviceId);
          checkCallServiceConnect(serviceId);
        } else {
          // When connector state changes back to i.e. "not_configure", clean up the service notifications
          removeAllServiceAndUserNotifications();
        }
      }
    }

    function checkDomainVerified(serviceId) {
      if (serviceId !== 'squared-fusion-uc' && serviceId !== 'squared-fusion-ec') {
        return;
      }
      if (vm.hasVerifiedDomains) {
        return;
      }
      DomainManagementService.getVerifiedDomains()
        .then(function () {
          return DomainManagementService.domainList;
        })
        .then(function (domainList) {
          if (domainList.length === 0) {
            NotificationService.addNotification(
              NotificationService.types.TODO,
              'noDomains',
              1,
              'modules/hercules/notifications/no-domains.html', [serviceId]
            );
          } else {
            NotificationService.removeNotification('noDomains');
            vm.hasVerifiedDomains = true;
          }
        });
    }

    function removeAllUserNotifications() {
      NotificationService.removeNotification('squared-fusion-uc:noUsersActivated');
      NotificationService.removeNotification('squared-fusion-uc:noUsersActivated');
      NotificationService.removeNotification('squared-fusion-cal:noUsersActivated');
    }

    function removeAllServiceNotifications() {
      NotificationService.removeNotification('sipDomainNotConfigured');
      NotificationService.removeNotification('sipUriDomainEnterpriseNotConfigured');
      NotificationService.removeNotification('callServiceConnectAvailable');
    }

    function removeAllServiceAndUserNotifications() {
      removeAllUserNotifications();
      removeAllServiceNotifications();
    }

    function checkIfFusePerformed() {
      var clusters = ClusterService.getClustersByConnectorType('c_mgmt');
      if (_.size(clusters) === 0) {
        NotificationService.addNotification(
          NotificationService.types.TODO,
          'fuseNotPerformed',
          1,
          'modules/hercules/notifications/fuse-not-performed.html', allExpresswayServices);
        return false;
      } else {
        NotificationService.removeNotification('fuseNotPerformed');
        return true;
      }
    }

    function checkIfConnectorsConfigured(connectorType) {
      var clusters = ClusterService.getClustersByConnectorType(connectorType);
      var areAllConnectorsConfigured = _.every(clusters, function (cluster) {
        return allConnectorsConfigured(cluster, connectorType);
      });
      if (!areAllConnectorsConfigured) {
        NotificationService.addNotification(
          NotificationService.types.TODO,
          'configureConnectors',
          2,
          'modules/hercules/notifications/configure_connectors.html', allExpresswayServices);
        return false;
      } else {
        NotificationService.removeNotification('configureConnectors');
        return true;
      }
    }

    function setSipUriNotificationAcknowledgedAndRemoveNotification() {
      NotificationService.removeNotification('sipUriDomainEnterpriseNotConfigured');
      vm.isSipUriAcknowledged = true;
    }

    function addNotification(notificationId, serviceId, notification) {
      NotificationService.addNotification(
        NotificationService.types.TODO,
        notificationId,
        4,
        notification, [serviceId]);
    }

    function checkUserStatuses(serviceId) {
      if (serviceId === 'squared-fusion-mgmt') {
        return;
      }
      var summaryForService = _.find(USSService.getStatusesSummary(), {
        serviceId: serviceId
      });
      var noUsersActivatedId = serviceId + ':noUsersActivated';
      var needsUserActivation = summaryForService && summaryForService.activated === 0 && summaryForService.error === 0 && summaryForService.notActivated === 0;
      if (needsUserActivation) {
        switch (serviceId) {
          case "squared-fusion-cal":
            addNotification(noUsersActivatedId, serviceId, 'modules/hercules/notifications/no_users_activated_for_calendar.html');
            break;
          case "squared-fusion-uc":
            ServiceDescriptor.isServiceEnabled("squared-fusion-ec", function (error, enabled) {
              if (!error) {
                if (enabled) {
                  addNotification(noUsersActivatedId, serviceId, 'modules/hercules/notifications/no_users_activated_for_call_connect.html');
                } else {
                  addNotification(noUsersActivatedId, serviceId, 'modules/hercules/notifications/no_users_activated_for_call_aware.html');
                }
              }
            });
            break;
          default:
            break;
        }
      } else {
        NotificationService.removeNotification(noUsersActivatedId);
        if (serviceId === 'squared-fusion-uc') {
          // Call Service has two sub-services, need special handling
          var awareStatus = summaryForService;
          var connectStatus = _.find(USSService.getStatusesSummary(), {
            serviceId: 'squared-fusion-ec'
          });

          if ((awareStatus && awareStatus.error > 0) || (connectStatus && connectStatus.error > 0)) {
            var userErrorsId = serviceId + ':userErrors';
            var data = [];
            if (awareStatus.error > 0) {
              data.push(awareStatus);
            }
            if (connectStatus && connectStatus.error > 0) {
              data.push(connectStatus);
            }
            NotificationService.addNotification(
              NotificationService.types.ALERT,
              userErrorsId,
              4,
              'modules/hercules/notifications/call-user-errors.html', ['squared-fusion-uc'], data);
          } else {
            NotificationService.removeNotification(userErrorsId);
          }
        } else {
          // if we are not in the Call Service page, we must be in the Calendar Service page
          userErrorsId = serviceId + ':userErrors';
          if (summaryForService && summaryForService.error > 0) {
            NotificationService.addNotification(
              NotificationService.types.ALERT,
              userErrorsId,
              4,
              'modules/hercules/notifications/calendar-user-errors.html', ['squared-fusion-cal'], summaryForService);
          } else {
            NotificationService.removeNotification(userErrorsId);
          }

        }
      }
    }

    function handleAtlasSipUriDomainEnterpriseNotification(serviceId) {
      if (!vm.isSipUriAcknowledged) {
        FeatureToggleService.supports(FeatureToggleService.features.atlasSipUriDomainEnterprise)
          .then(function (support) {
            if (support) {
              if (vm.hasSipUriDomainConfigured) {
                return;
              }
              Orgservice.getOrg(function (data, status) {
                if (status === 200) {
                  if (data && data.orgSettings && data.orgSettings.sipCloudDomain) {
                    NotificationService.removeNotification('sipUriDomainEnterpriseNotConfigured');
                    vm.hasSipUriDomainConfigured = true;
                  } else {
                    addNotification('sipUriDomainEnterpriseNotConfigured', [serviceId], 'modules/hercules/notifications/sip_uri_domain_enterprise_not_set.html');
                  }
                }
              });
            } else {
              NotificationService.removeNotification('sipUriDomainEnterpriseNotConfigured');
            }
          });
      }
    }

    function checkCallServiceConnect(serviceId) {
      if (serviceId !== 'squared-fusion-uc') {
        return;
      }
      ServiceDescriptor.services(function (error, services) {
        if (!error) {
          var callServiceConnect = _.find(services || {}, {
            id: 'squared-fusion-ec'
          });
          if (callServiceConnect && callServiceConnect.enabled) {
            // we need to clear the notification after admin has setup enabled
            NotificationService.removeNotification('callServiceConnectAvailable');
            handleAtlasSipUriDomainEnterpriseNotification(serviceId);
            USSService.getOrg(Authinfo.getOrgId()).then(function (org) {
              if (!org || !org.sipDomain || org.sipDomain === '') {
                NotificationService.addNotification(
                  NotificationService.types.TODO,
                  'sipDomainNotConfigured',
                  5,
                  'modules/hercules/notifications/sip_domain_not_configured.html', [serviceId]);
              } else {
                NotificationService.removeNotification('sipDomainNotConfigured');
              }
            });
          } else {
            NotificationService.removeNotification('sipDomainNotConfigured');
            if (callServiceConnect && !callServiceConnect.enabled && !callServiceConnect.acknowledged) {
              NotificationService.addNotification(
                NotificationService.types.NEW,
                'callServiceConnectAvailable',
                5,
                'modules/hercules/notifications/connect_available.html', [serviceId]);
            } else {
              NotificationService.removeNotification('callServiceConnectAvailable');
            }
          }
        }
      });
    }

    function allConnectorsConfigured(cluster, connectorType) {
      return _.chain(cluster.connectors)
        .filter(function (connector) {
          return connector.connectorType === connectorType;
        })
        .every(function (connector) {
          return connector.state !== 'not_configured' && connector.state !== 'not_installed';
        })
        .value();
    }

    return {
      checkState: checkState,
      setSipUriNotificationAcknowledgedAndRemoveNotification: setSipUriNotificationAcknowledgedAndRemoveNotification
    };
  }
}());
