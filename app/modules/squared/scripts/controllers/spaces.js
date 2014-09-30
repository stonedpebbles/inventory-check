'use strict';
/* global moment */

angular.module('Squared')
  .controller('SpacesCtrl', ['$scope', '$location', 'Auth', 'Storage', 'Log', 'Utils', '$filter', 'SpacesService', 'Authinfo', 'Notification', 'Config',
    function($scope, $location, Auth, Storage, Log, Utils, $filter, SpacesService, Authinfo, Notification, Config) {

      //Populating authinfo data if empty.
      var token = Storage.get('accessToken');
      if (Auth.isAuthorized($scope)) {
        Log.debug('Authinfo data is loaded.');
      }

      var formatActivationCode = function(activationCode) {
        var acode = '';
        if (activationCode)
        {
          var parts = activationCode.match(/[\s\S]{1,4}/g) || [];
          for (var x=0; x < parts.length-1; x++)
          {
            acode = acode + parts[x]+' ';
          }
          acode = acode + parts[parts.length-1];
        }
        return acode;
      };

      var getAllRooms = function() {
        SpacesService.listRooms(function(data, status){
          if(data.success === true ){
            var devices = [];
            if (data.devices)
            {
              for (var i = 0; i < data.devices.length; i++) {
                var device = data.devices[i];
                var adate = device.activationTime;
                if (adate && adate.length > 0)
                {
                  adate = moment.utc(adate).local().format('MMM D YYYY, h:mm a');
                }

                var activationCode = device.activationCode;
                if (activationCode && activationCode.length > 0)
                {
                  activationCode = formatActivationCode(activationCode);
                }

                devices.push({'room': device.accountName, 'code': activationCode, 'activationDate': adate});
              }
            }
            $scope.roomData = devices;
          }
          else{
            Log.error('Error getting rooms. Status: ' + status);
          }
        });
      };

      getAllRooms();

      $scope.newRoomName = null;
      $scope.gridOptions = {
        data: 'roomData',
        multiSelect: false,
        showFilter: true,
        rowHeight: 38,
        headerRowHeight: 38,
        sortInfo: { fields: ['activationDate','room'],
                    directions: ['asc']},

        columnDefs: [{field:'room', displayName:'Room'},
                     {field:'code', displayName:'Activation Code'},
                     {field:'activationDate', displayName:'Activation Date'}]
      };


      Notification.init($scope);
      $scope.popup = Notification.popup;

      $scope.clearRoom = function() {
        angular.element('#newRoom').val('');
        $scope.newRoomName = null;
      };

      $scope.addRoom = function(){
        SpacesService.addRoom($scope.newRoomName, function(data, status){
          if(data.success === true ){
            var successMessage = [$scope.newRoomName + ' added successfully.'];
            Notification.notify(successMessage, 'success');
            setTimeout(function(){
              getAllRooms();
            }, 1000);
            $scope.clearRoom();
          }
          else{
            var errorMessage = ['Error adding ' + $scope.newRoomName + '. Status: ' + status];
            Notification.notify(errorMessage, 'error');
          }
        });
      };
    }
]);