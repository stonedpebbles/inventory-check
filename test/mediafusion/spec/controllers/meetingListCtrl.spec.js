'use strict';

//Below is the Test Suit written for MeetingListController.
describe('Controller: ListMeetingsCtrl', function () {

  // load the controller's module
  beforeEach(module('wx2AdminWebClientApp'));

  //Initialize variables
  var MeetingsCtrl,scope,httpBackend,meetinglistData,meetingLdrBrdData,meetinglistinfoData,participantlistData;

   /* Initialize the controller and a mock scope
  * Reading the json data to application variable.
  * Making a fake call to return json data to make unit test cases to be passed.
  */
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();

    meetinglistData = getJSONFixture('mediafusion/json/meetings/meetingListData.json');
    meetingLdrBrdData = getJSONFixture('mediafusion/json/meetings/meetingLeaderBoardData.json');
    meetinglistinfoData = getJSONFixture('mediafusion/json/meetings/meetingListinfoData.json');
    participantlistData = getJSONFixture('mediafusion/json/meetings/participantListData.json');

    MeetingsCtrl = $controller('ListMeetingsCtrl', {
      $scope: scope
    });

    scope.queryMeetingsList = meetinglistData.meetings;
    scope.querymeetingslistinfo = meetinglistinfoData.meetings;
    scope.queryparticipantlistinfo = participantlistData.partDetails;
    scope.searchString = meetinglistData.searchString;
    scope.totalEnterpriseMeetings = meetingLdrBrdData.totalEnterpriseMeetings;
    scope.totalEnterpriseParticipants = meetingLdrBrdData.totalEnterpriseParticipants;
    scope.totalCloudMeetings = meetingLdrBrdData.totalCloudMeetings;
    scope.totalCloudParticipants = meetingLdrBrdData.totalCloudParticipants;

  }));

  //Test Specs

  it('MeetingsCtrl controller should be defined', function () {
    expect(MeetingsCtrl).toBeDefined();
  });

  it('scope should not be null', function () {
    expect(scope).not.toBeNull();
  });

  it('scope should be defined', function () {
    expect(scope).toBeDefined();
  });

  it('grid oprions should be defined', function () {
    expect(scope.gridOptions).toBeDefined();
  });

  it('response status should be success', function () {
    expect(meetinglistData.success).toBe(true);
  });
  
   it('response status should be success', function () {
    expect(meetinglistinfoData.success).toBe(true);
  });

    it('response status should be success', function () {
    expect(participantlistData.success).toBe(true);
  });

  it('querymeetingslist should be defined', function () {
    expect(scope.queryMeetingsList).toBeDefined();
  });
  
  it('querymeetingslistinfo should be defined', function () {
    expect(scope.querymeetingslistinfo).toBeDefined();
  });

  it('queryParticipantlistinfo should be defined', function () {
    expect(scope.queryparticipantlistinfo).toBeDefined();
  })

  it('Should have meeting data of size 5', function () {
    expect(scope.queryMeetingsList.length).toBe(5);
  });

  it('searchMeetingList() should be defined', function () {
    expect(scope.searchMeetingList).toBeDefined();
  });

  it('Search String should be SearchKey', function () {
    expect(scope.searchString).toBe("SearchKey");
  });

  it('getEnterpriseAndCloudMeetings() should be defined', function () {
    expect(scope.getEnterpriseAndCloudMeetings).toBeDefined();
  });

  it('Total EnterpriseMeetings should be 5000', function () {
    expect(scope.totalEnterpriseMeetings).toBe(5000);
  });

  it('Total EnterpriseParticipants should be 6000', function () {
    expect(scope.totalEnterpriseParticipants).toBe(6000);
  });

  it('Total CloudMeetings should be 7000', function () {
    expect(scope.totalCloudMeetings).toBe(7000);
  });

  it('Total CloudParticipants should be 8000', function () {
    expect(scope.totalCloudParticipants).toBe(8000);
  });

});