'use strict';

//Defining a controller for Alarms with required dependencies.
angular.module('Mediafusion')
  .controller('AlarmListCtrl', ['$scope', '$rootScope', '$filter', '$state', '$timeout', 'Log', 'AlarmListService',
    function ($scope, $rootScope, $filter, $state, $timeout, Log, AlarmListService) {
      //console.log("In AlarmListCtrl");

      $scope.test = AlarmListService.name;
      $scope.queryAlarmInfo = [];

      $scope.searchString = "";
      $scope.load = true;
      $scope.currentDataPosition = 1;
      $scope.lastScrollPosition = 0;

      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showAlarmDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var severityTemplate = '<div class="ngCellText col-xs-30" ><img  ng-src="modules/mediafusion/images/{{row.getProperty(col.field)}}.png" title="{{row.getProperty(col.field)}}"/>';

      $scope.gridOptions = {
        data: 'queryAlarmList',
        multiSelect: false,
        showFilter: true,
        rowHeight: 44,
        rowTemplate: rowTemplate,
        headerRowHeight: 40,
        useExternalSorting: false,

        columnDefs: [{
          field: 'severity',
          cellTemplate: severityTemplate,
          displayName: 'Severity'
        }, {
          field: 'name',
          displayName: 'Alarm Name'
        }, {
          field: 'entity',
          displayName: 'System Name'
        }, {
          field: 'entity',
          displayName: 'IP Address'
        }, {
          field: 'state',
          displayName: 'Status'
        }, {
          field: 'timestamp',
          displayName: 'Timestamp'
        }, {
          field: 'description',
          displayName: 'Description'
        }, {
          field: 'action',
          displayName: 'Action'
        }]
      };

      /**
       * getAlarmList function will fetch and populate Alarm list table with the Alarm info from its
       * repective AlarmListService.
       * queryAlarmList should be populated.
       */

      var getAlarmList = function (startAt) {
        try {
          var pageNo = startAt || 1;
          AlarmListService.queryAlarmList(pageNo, $scope.searchString, function (data, status) {

            if (data.success) {
              $timeout(function () {
                $scope.load = true;
              });

              if (pageNo === 1) {
                $scope.queryAlarmList = data.alarms;
              } else {
                $scope.queryAlarmList = $scope.queryAlarmList.concat(data.alarms);
              }
            } else {
              Log.debug('Query existing alarms failed. Status: ' + status);
            }

          });
        } catch (e) {
          //console.log("Ex" + e);
        }
      };
      getAlarmList();

      /* getAlarminfo will fetch additional details about the alarms */
      var getAlarminfo = function (alarm) {

        AlarmListService.queryAlarmList(alarm, function (data, status) {
          if (data.success) {
            $scope.queryalarmmetric = data.alarms;
          } else {
            Log.debug('Query existing alarms failed. Status: ' + status);
          }
        });
      };

      $scope.showAlarmDetails = function (alarm) {
        //console.log("Inside showAlarmDetails");
        $scope.currentAlarm = alarm;
        //$rootScope.alarmtype = alarm.alarmtype;

        $scope.queryAlarmDetails = alarm;

        /*MeetingListService.listMeetingsinfo(startDateTime, function (data, status) {
          if (data.success) {
            $scope.querymeetingslistinfo = data.meetings;
          } else {
            Log.debug('Query existing meetings failed. Status: ' + status);
          }
        });*/

        $state.go('alarms.preview');
      };

      /**
       * searchAlarmList will search in alarm table data. Its a search happens in DB.
       */
      $scope.searchAlarmList = function () {
        //console.log("searchAlarmList");
        if ($scope.searchString !== null) {
          $scope.currentDataPosition = 1;
          getAlarmList($scope.currentDataPosition);
        }
      };
      $scope.$on('ngGridEventScroll', function () {
        if ($scope.load) {
          $scope.load = false;
          var ngGridView = $scope.gridOptions.ngGrid.$viewport[0];
          var scrollTop = ngGridView.scrollTop;
          var scrollHeight = ngGridView.scrollHeight;
          //console.log(scrollTop);
          //console.log(scrollHeight);
          $scope.currentDataPosition++;
          getAlarmList($scope.currentDataPosition);
          //console.log('Scrolled .. ');
        }
      });

      $rootScope.$on('$stateChangeSuccess', function () {
        //console.log("entering stateChangeSuccess");
        if ($state.includes('alarms.preview')) {
          // console.log("entering preview");
          $scope.alarmPreviewActive = true;
          // console.log("alarmPreviewActive : " + $scope.alarmPreviewActive);
        } else {
          $scope.alarmPreviewActive = false;
          // console.log("alarmPreviewActive : " + $scope.alarmPreviewActive);
        }
      });

    }

  ]);