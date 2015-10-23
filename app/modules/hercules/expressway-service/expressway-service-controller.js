(function () {
  'use strict';

  // TODO: Don't like this linking to routing name...
  var serviceType2RouteName = function (serviceType) {
    switch (serviceType) {
    case 'c_cal':
      return "calendar-service";
    case 'c_ucmc':
      return "call-service";
    case 'c_mgmt':
      return "management-service";
    default:
      //console.error("serviceType " + serviceType + " not supported in this controller");
      return "";
    }
  };

  var serviceType2ServiceId = function (serviceType) {
    switch (serviceType) {
    case 'c_cal':
      return "squared-fusion-cal";
    case 'c_ucmc':
      return "squared-fusion-uc";
    case 'c_mgmt':
      return "squared-fusion-mgmt";
    default:
      //console.error("serviceType " + serviceType + " not supported in this controller");
      return "";
    }
  };

  var serviceId2ServiceType = function (serviceId) {
    switch (serviceId) {
    case 'squared-fusion-cal':
      return "c_cal";
    case 'squared-fusion-uc':
      return "c_ucmc";
    case 'squared-fusion-mgmt':
      return "c_mgmt";
    default:
      //console.error("serviceType " + serviceType + " not supported in this controller");
      return "";
    }
  };

  //TODO: Rewrite or use some existing stuff !!!!!!!!!!!!
  var enableEmailValidation = function () {
    //TODO: Someone rewrite code below - it's just a placeholder
    //No real functionality here, just needed something so I could style the input

    $(document).on('keyup', '#add-mails', function (e) {
      //console.log(e.keyCode);
      switch (e.keyCode) {
      case 13:
        addMail();
        break;

      case 186:
        addMail();
        break;

      case 188:
        addMail();
        break;
      }

      function addMail() {
        var mail = $("#add-mails").val();
        var pattern =
          /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
        if (mail.indexOf(",") > -1 || mail.indexOf(";") > -1) {
          //console.log("has , or ;");
          mail = mail.slice(0, -1);
        }

        if (mail !== "") {
          if (!pattern.test(mail)) {
            $("#existing-mails").append("<p class='token-label alert'>" + mail + "<span class='del icon icon-close'></span></p>");
          } else {
            $("#existing-mails").append("<p class='token-label'>" + mail + "<span class='del icon icon-close'></span></p>");
          }
        }

        $("#add-mails").val("");
      }
    });
  };

  /* @ngInject */
  function ExpresswayServiceController(XhrNotificationService, NotificationService, ServiceStateChecker, ServiceDescriptor, $stateParams, $state,
    $modal,
    $scope, ClusterService, USSService2, ConverterService, ServiceStatusSummaryService) {

    ClusterService.subscribe('data', clustersUpdated, {
      scope: $scope
    });

    USSService2.subscribeStatusesSummary('data', extractSummaryForAService, {
      scope: $scope
    });

    var vm = this;
    vm.loading = true;
    vm.state = $state;
    vm.currentServiceType = $state.current.data.serviceType;
    vm.currentServiceId = serviceType2ServiceId(vm.currentServiceType);
    vm.selectedRow = -1;
    //TODO: Don't like this linking to routes...
    vm.route = serviceType2RouteName(vm.currentServiceType);
    vm.notificationTag = vm.currentServiceId;
    vm.clusters = _.values(ClusterService.getClusters());
    vm.clusterLength = function () {
      return _.size(vm.clusters);
    };
    vm.serviceIconClass = ServiceDescriptor.serviceIcon(vm.currentServiceId);

    if (vm.currentServiceId == "squared-fusion-mgmt") {
      vm.serviceEnabled = true;
      vm.loading = false;
    } else {
      vm.serviceEnabled = false;
      ServiceDescriptor.isServiceEnabled(serviceType2ServiceId(vm.currentServiceType), function (a, b) {
        vm.serviceEnabled = b;
        vm.loading = false;
      });
    }

    vm.serviceNotInstalled = function (cluster) {
      return ServiceStatusSummaryService.serviceNotInstalled(vm.currentServiceType, cluster);
    };

    vm.softwareUpgradeAvailable = function (cluster) {
      return ServiceStatusSummaryService.softwareUpgradeAvailable(vm.currentServiceType, cluster);
    };

    vm.softwareVersionAvailable = function (cluster) {
      return ServiceStatusSummaryService.serviceFromCluster(vm.currentServiceType, cluster).software_upgrade_available ?
        ServiceStatusSummaryService.serviceFromCluster(vm.currentServiceType, cluster).not_approved_package.version : "?";
    };

    vm.selectedClusterAggregatedStatus = function (cluster) {
      return ServiceStatusSummaryService.clusterAggregatedStatus(vm.currentServiceType, cluster);
    };

    function clustersUpdated() {
      ServiceStateChecker.checkState(vm.currentServiceType, vm.currentServiceId);
      vm.clusters = _.values(ClusterService.getClusters());
    }

    function extractSummaryForAService() {
      vm.userStatusSummary = _.find(USSService2.getStatusesSummary(), {
        serviceId: serviceType2ServiceId(vm.currentServiceType)
      });
    }

    vm.openUserStatusReportModal = function (serviceId) {
      $scope.currentServiceId = serviceId; //TODO: Fix. Currently compatible with "old" concept...
      $scope.modal = $modal.open({
        scope: $scope,
        controller: 'ExportUserStatusesController',
        templateUrl: 'modules/hercules/export/export-user-statuses.html'
      });
    };

    vm.enableService = function (serviceId) {
      ServiceDescriptor.setServiceEnabled(serviceId, true, function (error) {
        if (error !== null) {
          XhrNotificationService.notify("Problems enabling the service");
        }
      });
      vm.serviceEnabled = true;
    };

    vm.showClusterDetails = function (cluster) {
      $state.go('cluster-details-new', {
        cluster: cluster,
        serviceType: vm.currentServiceType
      });
    };

    vm.clusterListGridOptions = {
      data: 'exp.clusters',
      enableSorting: false,
      multiSelect: false,
      showFilter: false,
      showFooter: false,
      rowHeight: 75,
      rowTemplate: 'modules/hercules/expressway-service/cluster-list-row-template.html',
      headerRowHeight: 44,
      columnDefs: [{
        field: 'name',
        displayName: 'Expressway Clusters',
        cellTemplate: 'modules/hercules/expressway-service/cluster-list-display-name.html',
        width: '35%'
      }, {
        displayName: 'Service Status',
        cellTemplate: 'modules/hercules/expressway-service/cluster-list-status.html',
        width: '65%'
      }]
    };

    vm.openUserErrorsModal = function () {
      $scope.modal = $modal.open({
        scope: $scope,
        controller: 'UserErrorsController',
        controllerAs: 'userErrorsCtrl',
        templateUrl: 'modules/hercules/expressway-service/user-errors.html',
        resolve: {
          serviceId: function () {
            return vm.currentServiceId;
          }
        }
      });
    };
  }

  /* @ngInject */
  function ExpresswayServiceDetailsController(XhrNotificationService, ServiceStatusSummaryService, $state, $modal, $stateParams, ClusterService) {
    var vm = this;
    vm.state = $state;
    vm.clusterId = $stateParams.cluster.id;
    vm.serviceType = $stateParams.serviceType;

    vm.cluster = ClusterService.getClusters()[vm.clusterId];

    vm.selectedService = function () {
      return _.find(vm.cluster.services, {
        service_type: vm.serviceType
      });
    };

    vm.alarms2hosts = _.memoize(function () {
      var alarms = {};

      _.forEach(vm.selectedService().connectors, function (conn) {
        _.forEach(conn.alarms, function (alarm) {
          if (!alarms[alarm.id]) {
            alarms[alarm.id] = {
              alarm: alarm,
              hosts: []
            };
          }
          alarms[alarm.id].hosts.push(conn.host);
        });
      });
      var mappedAlarms = _.toArray(alarms);
      return mappedAlarms;
    });

    //TODO: Don't like this linking to routes...
    vm.route = serviceType2RouteName(vm.serviceType);

    vm.serviceNotInstalled = function () {
      return ServiceStatusSummaryService.serviceNotInstalled(vm.serviceType, vm.cluster);
    };

    vm.upgrade = function () {
      $modal.open({
        templateUrl: "modules/hercules/expressway-service/software-upgrade-dialog.html",
        controller: SoftwareUpgradeController,
        controllerAs: "softwareUpgrade"
      }).result.then(function () {
        //console.log("Starting upgrade dialog...");
      });
    };

    vm.showAlarms = function () {
      $modal.open({
        templateUrl: "modules/hercules/expressway-service/alarms.html",
        controller: AlarmsController,
        controllerAs: "alarmsDialog"
      }).result.then(function () {
        //console.log("Starting alarms dialog...");
      });
    };

    vm.deleteHost = function (host) {
      //console.log("Delete host ",host)
      return ClusterService.deleteHost(vm.clusterId, host.serial).then(function () {
        //TODO: Update page
      }, XhrNotificationService.notify);
    };

    /* @ngInject */
    function SoftwareUpgradeController($modalInstance) {
      var modalVm = this;
      modalVm.newVersion = vm.selectedService.not_approved_package.version;
      modalVm.oldVersion = vm.selectedService.connectors[0].version;
      modalVm.ok = function () {
        $modalInstance.close();
      };
      modalVm.cancel = function () {
        $modalInstance.dismiss();
      };
      modalVm.clusterName = vm.cluster.name;
    }

    /* @ngInject */
    function AlarmsController($modalInstance) {
      var alarmsVm = this;
      alarmsVm.connectors = vm.selectedService.connectors;

      alarmsVm.colorFromSeverity = function (alarm) {
        if (alarm.severity === "error") {
          return "red";
        } else if (alarm.severity === "critical") {
          return "orange";
        } else {
          return "black";
        }
      };

      alarmsVm.ok = function () {
        $modalInstance.close();
      };
      alarmsVm.cancel = function () {
        $modalInstance.dismiss();
      };
    }
  }

  /* @ngInject */
  function DisableConfirmController(ServiceDescriptor, $modalInstance, serviceId) {
    var modalVm = this;
    modalVm.serviceId = serviceId;
    modalVm.serviceIconClass = ServiceDescriptor.serviceIcon(serviceId);

    modalVm.ok = function () {
      $modalInstance.close();
    };
    modalVm.cancel = function () {
      $modalInstance.dismiss();
    };
  }

  /* @ngInject */
  function ExpresswayServiceSettingsController($state, $modal, ServiceDescriptor, Authinfo, USSService2, $stateParams, NotificationConfigService,
    MailValidatorService, XhrNotificationService, CertService, Notification) {
    var vm = this;
    vm.config = "";
    vm.wx2users = "";
    vm.serviceType = $stateParams.serviceType;
    vm.serviceId = serviceType2ServiceId(vm.serviceType);

    enableEmailValidation();

    var readCerts = function () {
      CertService.getCerts(Authinfo.getOrgId()).then(function (res) {
        vm.certificates = res || [];
      }, function (err) {
        return XhrNotificationService.notify(err);
      });
    };

    vm.squaredFusionEc = false;
    ServiceDescriptor.isServiceEnabled("squared-fusion-ec", function (a, b) {
      vm.squaredFusionEc = b;
      if (vm.squaredFusionEc) {
        readCerts();
      }
    });

    vm.storeEc = function () {
      //console.log("store ec", vm.squaredFusionEc)
      ServiceDescriptor.setServiceEnabled("squared-fusion-ec", vm.squaredFusionEc,
        function (err) {
          // TODO: fix this callback crap!
          if (err) {
            XhrNotificationService.notify("Failed to enable Aware");
          }
        }
      );
      if (vm.squaredFusionEc) {
        readCerts();
      }
    };

    vm.loading = true;
    USSService2.getOrg(Authinfo.getOrgId()).then(function (res) {
      vm.loading = false;
      vm.sipDomain = res.sipDomain;
      vm.org = res || {};
    }, function (err) {
      //  if (err) return notification.notify(err);
    });

    vm.updateSipDomain = function () {
      vm.savingSip = true;

      USSService2.updateOrg(vm.org).then(function (res) {
        vm.savingSip = false;
      }, function (err) {
        vm.savingSip = false;
        Notification.error("hercules.errors.sipDomainInvalid");
      });
    };

    vm.config = "";
    NotificationConfigService.read(function (err, config) {
      vm.loading = false;
      if (err) {
        return XhrNotificationService.notify(err);
      }
      vm.config = config || {};
      if (vm.config.wx2users.length > 0) {
        vm.wx2users = _.map(vm.config.wx2users.split(','), function (user) {
          return {
            text: user
          };
        });
      } else {
        vm.wx2users = [];
      }
    });
    vm.cluster = $stateParams.cluster;

    vm.writeConfig = function () {
      vm.config.wx2users = _.map(vm.wx2users, function (data) {
        return data.text;
      }).toString();
      if (vm.config.wx2users && !MailValidatorService.isValidEmailCsv(vm.config.wx2users)) {
        Notification.error("hercules.errors.invalidEmail");
      } else {
        vm.savingEmail = true;
        NotificationConfigService.write(vm.config, function (err) {
          vm.savingEmail = false;
          if (err) {
            return XhrNotificationService.notify(err);
          }
        });
      }
    };

    vm.disableService = function (serviceId) {
      ServiceDescriptor.setServiceEnabled(serviceId, false, function (error) {
        // TODO: Strange callback result ???
        if (error !== null) {
          XhrNotificationService.notify(error);
        }
      });
      vm.serviceEnabled = false;
    };

    vm.confirmDisable = function (serviceId) {
      $modal.open({
        templateUrl: "modules/hercules/expressway-service/confirm-disable-dialog.html",
        controller: DisableConfirmController,
        controllerAs: "disableConfirmDialog",
        resolve: {
          serviceId: function () {
            return serviceId;
          }
        }
      }).result.then(function () {
        vm.disableService(serviceId);
        //TODO: Fix this hack!
        $state.go(serviceType2RouteName(serviceId2ServiceType(serviceId)) + ".list", {
          serviceType: serviceId2ServiceType(serviceId)
        }, {
          reload: true
        });
      });
    };

    vm.uploadCert = function (file, event) {
      if (!file) {
        return;
      }
      CertService.uploadCert(Authinfo.getOrgId(), file).then(readCerts, XhrNotificationService.notify);
    };

    vm.confirmCertDelete = function (cert) {
      $modal.open({
        templateUrl: "modules/hercules/expressway-service/confirm-certificate-delete.html",
        controller: ConfirmCertificateDeleteController,
        controllerAs: "confirmCertificateDelete",
        resolve: {
          cert: function () {
            return cert;
          }
        }
      }).result.then(readCerts);
    };

    vm.invalidEmail = function (tag) {
      Notification.error(tag.text + " is not a valid email");
    };

  }

  /* @ngInject */
  function ConfirmCertificateDeleteController(CertService, $modalInstance, XhrNotificationService, cert) {
    var vm = this;
    vm.cert = cert;
    vm.remove = function () {
      CertService.deleteCert(vm.cert.certId).then($modalInstance.close, XhrNotificationService.notify);
    };
    vm.cancel = function () {
      $modalInstance.dismiss();
    };
  }

  /* @ngInject */
  function AlarmController($stateParams) {
    var vm = this;
    vm.alarm = $stateParams.alarm;
    vm.host = $stateParams.host;
  }

  /* @ngInject */
  function HostDetailsController($stateParams, $state, ClusterService, XhrNotificationService) {
    var vm = this;
    vm.host = $stateParams.host;
    vm.cluster = ClusterService.getClusters()[$stateParams.clusterId];
    vm.serviceType = $stateParams.serviceType;
    vm.connector = function () {
      var service = _.find(vm.cluster.services, {
        service_type: vm.serviceType
      });
      return _.find(service.connectors, function (connector) {
        return connector.host.serial == vm.host.serial;
      });
    };

    vm.deleteHost = function () {
      return ClusterService.deleteHost(vm.clusterId, vm.connector.host.serial).then(function () {
        if (ClusterService.getClusters()[vm.clusterId]) {
          $state.go('cluster-details', {
            clusterId: vm.clusterId
          });
        } else {
          $state.sidepanel.close();
        }
      }, XhrNotificationService.notify);
    };
  }

  /* @ngInject */
  function ExpresswayClusterSettingsController(ServiceStatusSummaryService, $modal, $stateParams, ClusterService, $scope, XhrNotificationService) {
    var vm = this;
    vm.clusterId = $stateParams.clusterId;
    vm.serviceType = $stateParams.serviceType;
    vm.cluster = ClusterService.getClusters()[vm.clusterId];
    vm.saving = false;

    vm.selectedService = function () {
      return _.find(vm.cluster.services, {
        service_type: vm.serviceType
      });
    };

    vm.activeActiveApplicable = (vm.serviceType == 'c_cal' || vm.serviceType == 'c_ucmc');
    vm.activeActivePossible = vm.cluster.hosts.length > 1;
    vm.activeActiveEnabled = vm.activeActiveApplicable && isActiveActiveEnabled(vm.cluster, vm.serviceType);
    vm.activeActiveEnabledOld = vm.activeActiveApplicable && isActiveActiveEnabled(vm.cluster, vm.serviceType);

    var managementServiceType = "c_mgmt";
    vm.managementService = _.find(vm.cluster.services, {
      service_type: managementServiceType
    });

    vm.serviceNotInstalled = function () {
      return ServiceStatusSummaryService.serviceNotInstalled(vm.serviceType, vm.cluster);
    };

    function isActiveActiveEnabled(cluster, serviceType) {
      return cluster.properties && cluster.properties[activeActivePropertyName(serviceType)] == 'activeActive';
    }

    function activeActivePropertyName(serviceType) {
      switch (serviceType) {
      case 'c_cal':
        return 'fms.calendarAssignmentType';
      case 'c_ucmc':
        return 'fms.callManagerAssignmentType';
      default:
        return '';
      }
    }

    vm.showDeregisterDialog = function () {
      $modal.open({
        resolve: {
          cluster: function () {
            return vm.cluster;
          }
        },
        controller: 'ClusterDeregisterController',
        controllerAs: "clusterDeregister",
        templateUrl: 'modules/hercules/cluster-deregister/deregister-dialog.html'
      });
    };

    $scope.$watch('expresswayClusterSettingsCtrl.activeActiveEnabled', function (newVal, oldVal) {
      if (newVal !== undefined && newVal != oldVal) {
        vm.showButtons = newVal != vm.activeActiveEnabledOld;
      }
    });

    vm.save = function () {
      vm.saving = true;
      ClusterService.setProperty(vm.clusterId, activeActivePropertyName(vm.serviceType), vm.activeActiveEnabled ? 'activeActive' : 'standard')
        .then(function () {
          vm.saving = false;
        }, XhrNotificationService.notify);
    };

    vm.cancel = function () {
      vm.showButtons = false;
      vm.activeActiveEnabled = vm.activeActiveEnabledOld;
    };
  }

  /* @ngInject */
  function UserErrorsController(serviceId, USSService, XhrNotificationService, Userservice, ClusterService) {
    var vm = this;
    vm.loading = true;
    vm.limit = 5;
    vm.serviceId = serviceId;

    USSService.getStatuses(function (error, statuses) {
      if (error) {
        XhrNotificationService.notify("Failed to fetch user statuses", error);
        return;
      }
      if (statuses) {
        vm.totalCount = statuses.paging.count;
        vm.userStatuses = [];
        var connectorIds = [];

        _.forEach(statuses.userStatuses, function (userStatus) {
          if (userStatus.connectorId && !_.contains(connectorIds, userStatus.connectorId)) {
            connectorIds.push(userStatus.connectorId);
          }
          Userservice.getUser(userStatus.userId, function (data, status) {
            if (data.success) {
              userStatus.displayName = data.displayName || data.userName;
              vm.userStatuses.push(userStatus);
            }
          });
          return status;
        });

        _.forEach(connectorIds, function (connectorId) {
          ClusterService.getConnector(connectorId).then(function (connector) {
            if (connector) {
              _.forEach(statuses.userStatuses, function (userStatus) {
                if (userStatus.connectorId === connectorId) {
                  userStatus.connector = connector;
                }
              });
            }
          });
        });

      } else {
        vm.totalCount = 0;
        vm.userStatuses = [];
      }
      vm.loading = false;
    }, vm.serviceId, 'error', vm.limit);
  }

  angular
    .module('Hercules')
    .controller('ExpresswayServiceController', ExpresswayServiceController)
    .controller('ExpresswayServiceDetailsController', ExpresswayServiceDetailsController)
    .controller('ExpresswayServiceSettingsController', ExpresswayServiceSettingsController)
    .controller('ExpresswayClusterSettingsController', ExpresswayClusterSettingsController)
    .controller('DisableConfirmController', DisableConfirmController)
    .controller('AlarmController', AlarmController)
    .controller('HostDetailsController', HostDetailsController)
    .controller('UserErrorsController', UserErrorsController);
}());