'use strict';

describe('Controller: HuntGroupSetupAssistantCtrl - Hunt Member Lookup', function () {

  var $httpBackend, filter, controller, $scope, HuntGroupService, Notification;

  var user1 = getJSONFixture('huron/json/features/huntGroup/user1.json');
  var user2 = getJSONFixture('huron/json/features/huntGroup/user2.json');

  var successResponse = {
    "users": [user1, user2]
  };

  var member1 = {
    uuid: user1.uuid,
    displayUser: true,
    user: user1,
    selectableNumber: user1.numbers[0]
  };

  var member2 = {
    uuid: user2.uuid,
    displayUser: true,
    user: user2,
    selectableNumber: user2.numbers[0]
  };

  function listContains(someList, item) {
    return (someList.filter(function (elem) {
      return (elem.uuid == item.uuid);
    })).length > 0;
  }

  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(module('Huron'));
  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  var MemberLookupUrl = new RegExp(".*/customers/1/users.*");
  var GetMember = new RegExp(".*/customers/1/users/.*");

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, _$filter_,
    _HuntGroupService_, _Notification_) {
    $scope = $rootScope.$new();
    HuntGroupService = _HuntGroupService_;
    Notification = _Notification_;
    $httpBackend = _$httpBackend_;
    filter = _$filter_('huntMemberTelephone');

    controller = $controller('HuntGroupSetupAssistantCtrl', {
      $scope: $scope,
      HuntGroupService: HuntGroupService,
      Notification: Notification
    });

  }));

  it("notifies with error response when member fetch fails.", function () {
    spyOn(Notification, 'errorResponse');
    $httpBackend.expectGET(MemberLookupUrl).respond(500);
    controller.fetchHuntMembers("sun").then(function () {
      expect(Notification.errorResponse).toHaveBeenCalledWith(jasmine.anything(),
        'huronHuntGroup.memberFetchFailure');
    });
    $httpBackend.flush();
  });

  it("calls the backend only after 3 key strokes.", function () {
    $httpBackend.expectGET(MemberLookupUrl).respond(200, successResponse);
    controller.fetchHuntMembers("s");
    $scope.$apply();
    $httpBackend.verifyNoOutstandingRequest(); // No request made.

    controller.fetchHuntMembers("su");
    $scope.$apply();
    $httpBackend.verifyNoOutstandingRequest(); // No request made.

    controller.fetchHuntMembers("sun");
    $httpBackend.flush(); // Request made.
  });

  it("on selecting a member, the member is added into selectedHuntMembers list with email id retrieved from backend.",
    function () {
      expect(user1.email).toBeUndefined();
      user1.email = "sumuthur@cisco.com";
      user2.email = "test@cisco.com";

      expect(member2.user.email).not.toEqual(user1.email);

      $httpBackend.expectGET(GetMember).respond(200, user1);
      controller.selectHuntGroupMember(member2);
      $httpBackend.flush();

      expect(member2.user.email).toEqual(user1.email);
      expect(listContains(controller.selectedHuntMembers, member2)).toBeTruthy();
    });

  it("filters the selected members from showing in the drop down.", function () {
    // UI selected a member pill.
    selectHuntMember(member2);

    // Backend returns a list.
    $httpBackend.expectGET(MemberLookupUrl).respond(200, successResponse);

    // UI must filter and show only the list that is not already selected.
    controller.fetchHuntMembers(user2.firstName).then(function (dropdownList) {
      expect(listContains(dropdownList, member2)).toBeFalsy();
    });
    $httpBackend.flush();
  });

  it("on deselecting a member, the list is updated and drop down starts showing the deselected member.",
    function () {

      selectHuntMember(member1); // user 1 selected.
      selectHuntMember(member2); // user 2 selected.

      // Backend returns a list.
      $httpBackend.expectGET(MemberLookupUrl).respond(200, successResponse);

      // UI types in name of user1
      controller.fetchHuntMembers(user1.firstName).then(function (dropdownList) {
        expect(listContains(dropdownList, member1)).toBeFalsy(); // drop down must not show it.
      });
      $httpBackend.flush();

      controller.unSelectHuntGroupMember(member1); // used 1 is removed.

      // Backend returns a list.
      $httpBackend.expectGET(MemberLookupUrl).respond(200, successResponse);

      // UI types in number of user1 again.
      controller.fetchHuntMembers(user1.firstName).then(function (dropdownList) {
        expect(listContains(dropdownList, member1)).toBeTruthy(); // drop down must show this time.
      });
      $httpBackend.flush();

    });

  it("huntMemberTelephone filter concatenates 'and' between int & ext number if both are present.",
    function () {
      expect(filter(user1.numbers[0])).toBe("(972) 510-4001 and 4001");
      expect(filter(user1.numbers[1])).toBe("1236");
    });

  it("displays the member name with firstName and lastName correctly.", function () {
    expect(controller.getDisplayName(user1)).toBe("Sundar Rajan Muthuraj");
    user1.lastName = "";
    expect(controller.getDisplayName(user1)).toBe("Sundar Rajan");
  });

  it("member pane open works like accordion based on user's uuid.", function () {
    //toggleMemberPanel is invoked while clicking the card header, with user uuid as argument.
    controller.openMemberPanelUuid = undefined;

    controller.toggleMemberPanel("user1Uuid"); // user1 header clicked.
    expect(controller.openMemberPanelUuid).toBe("user1Uuid"); // opens user1 panel.
    controller.toggleMemberPanel("user1Uuid"); // user1 header clicked again.
    expect(controller.openMemberPanelUuid).toBeUndefined(); //closes user1 panel.

    controller.toggleMemberPanel("user1Uuid"); // user1 header clicked.
    controller.toggleMemberPanel("user2Uuid"); // user2 header clicked.
    expect(controller.openMemberPanelUuid).toBe("user2Uuid"); //shows user2 panel.
  });

  function selectHuntMember(member) {
    $httpBackend.expectGET(GetMember).respond(200, member.user);
    controller.selectHuntGroupMember(member);
    $httpBackend.flush();
  }
});
