import { Member } from 'modules/huron/members';

describe('Component: callPickupMembers', () => {
  const MEMBER_INPUT = 'input#memberInput';
  let membersList = getJSONFixture('huron/json/features/callPickup/membersList.json');
  let fake_picture_path = 'https://abcde/12345';
  let checkboxesList = getJSONFixture('huron/json/features/callPickup/checkboxesList.json');
  let numbersArray = getJSONFixture('huron/json/features/callPickup/numbersList.json');

  beforeEach(function () {
    this.initModules('huron.call-pickup.members');
    this.injectDependencies(
      '$scope',
      '$q',
      'FeatureMemberService',
      'Notification',
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'UserNumberService'
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    this.$scope.onUpdate = jasmine.createSpy('onUpdate');
    this.$scope.selectedMembers = [];
    this.$scope.$apply();

    this.getMemberListDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getMemberSuggestions').and.returnValue(this.getMemberListDefer.promise);

    this.getMemberPictureDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getMemberPicture').and.returnValue(this.getMemberPictureDefer.promise);

    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  function initComponent() {
    this.compileComponent('callPickupMembers', {
      onUpdate: 'onUpdate(member, isValidMember)',
      selectedMembers: 'selectedMembers',
    });
    this.$scope.$apply();
  }

  describe('get primary number', () => {
    beforeEach(initComponent);

    it('should return primary number', function() {
      let result = { uuid : '920b3f0f-fb6d-406c-b5b3-58c1bd390478', internalNumber: '2361' };
      let allNumbers = getJSONFixture('huron/json/features/callPickup/numbersList.json');
      expect(this.controller.getPrimaryNumber(allNumbers['numbers'])).toEqual(result);
    });
  });

  describe('member Test', () => {
    beforeEach(initComponent);

    it('should fetch a list of members', function () {
      this.view.find(MEMBER_INPUT).val('doe').change();
      this.getMemberListDefer.resolve(membersList);
      this.$scope.$apply();
      expect(this.controller.memberList.length).toEqual(6);
    });
  });

  describe('select member test', () => {
    let member1, member2, memberData, checkboxesList, allNumbers;

    beforeEach(initComponent);

    beforeEach(function() {
      this.controller.memberList = membersList;
      checkboxesList = getJSONFixture('huron/json/features/callPickup/checkboxesList.json');
      member1 = angular.copy(this.controller.memberList[0]);
      memberData = {
        member: member1,
        picturePath: fake_picture_path,
        checkboxes: checkboxesList,
        saveNumbers: [],
      };
      member2 = angular.copy(this.controller.memberList[1]);
      allNumbers = getJSONFixture('huron/json/features/callPickup/numbersList.json');
      spyOn(this.controller, 'getPrimaryNumber').and.callThrough();
      spyOn(this.controller, 'createCheckBoxes').and.callThrough();
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/0001/numbers').respond(200, allNumbers);
      this.$scope.$digest();
    });

    it('should be able to select members', function() {
      this.controller.selectedMembers = [];
      this.controller.maxMembersAllowed = 1;
      this.controller.selectMember(member1);
      this.getMemberPictureDefer.resolve(fake_picture_path);
      expect(this.controller.selectedMembers.length).toEqual(1);
      expect(this.$scope.onUpdate).toHaveBeenCalledWith(this.controller.selectedMembers, true);
      this.$httpBackend.flush();
      this.controller.selectMember(member2);
      expect(this.Notification.error).toHaveBeenCalledWith('callPickup.memberLimitExceeded');
    });

    it('should be able to remove members', function() {
      this.controller.selectedMembers.push(memberData);
      this.controller.removeMember(memberData);
      expect(this.controller.selectedMembers.length).toEqual(0);
    });

    it('member name input box should be empty when calling select member', function() {
      this.controller.memberList = membersList;
      this.controller.selectMember(member1);
      this.$httpBackend.flush();
      expect(this.controller.memberName).toBe('');
    });

    it('should create checkboxes for all numbers', function(){
      this.controller.createCheckBoxes(memberData, allNumbers['numbers']);
      expect(memberData.checkboxes[0].label).toEqual('2361');
      expect(memberData.checkboxes[0].value).toEqual(true);
      expect(memberData.checkboxes[0].sublabel).toEqual('');
      expect(memberData.checkboxes[0].numberUuid).toEqual('920b3f0f-fb6d-406c-b5b3-58c1bd390478');
    });

    it('should return empty string if the member is not in selectedMembers', function () {
      this.controller.selectedMembers.push(memberData);
      let mem2 = angular.copy(membersList[1]);
      expect(this.controller.getMembersPictures(mem2)).toEqual('');
    });
  });

  describe('update numbers', () => {
    let member1, member2, member3;
    beforeEach(initComponent);
    beforeEach(function() {
      this.controller.memberList = membersList;
      member1 = {
        member: angular.copy(this.controller.memberList[0]),
        picturePath: fake_picture_path,
        checkboxes: checkboxesList,
        saveNumbers: [],
      };
      member2 = {
        member: angular.copy(this.controller.memberList[1]),
        picturePath: fake_picture_path,
        checkboxes: [{
          label: '3252',
          numberUuid: '92bc097b-9099-4420-b609-659f5e3659b4',
          sublabel: '',
          value: false,
        }],
        saveNumbers: [{
          internalNumber: '3252',
          uuid: '92bc097b-9099-4420-b609-659f5e3659b4',
        }],
      };
      member3 = {
        member: angular.copy(this.controller.memberList[1]),
        picturePath: fake_picture_path,
        checkboxes: [{
          label: '3252',
          numberUuid: '92bc097b-9099-4420-b609-659f5e3659b4',
          sublabel: '',
          value: true,
        },
        {
          label: '3151',
          numberUuid: '82bc097b-9099-4420-b609-659f5e3659b4',
          sublabel: '',
          value: true,
        }],
        saveNumbers: [{
          internalNumber: '3151',
          uuid: '82bc097b-9099-4420-b609-659f5e3659b4',
        }],
      };
    });

    it('should update number for a member based on checkbox selection', function() {
      let saveNumber = {
        internalNumber: '3252',
        uuid: '92bc097b-9099-4420-b609-659f5e3659b4',
      };
      this.controller.updateNumbers(member1);
      expect(member1.saveNumbers).not.toContain(saveNumber);
    });

    it('should give error if any member has no checkbox selected', function() {
      this.controller.selectedMembers = member2;
      spyOn(this.controller, 'verifyLineSelected').and.callFake(function() {
        return false;
      });
      this.controller.updateNumbers(member2);
      expect(this.Notification.error).toHaveBeenCalledWith('callPickup.minMemberWarning');
    });

    it('should not update number if its already present in save numbers', function() {
      let saveNumber = {
        internalNumber: '3252',
        uuid: '92bc097b-9099-4420-b609-659f5e3659b4',
      };
      this.controller.updateNumbers(member3);
      expect(member3.saveNumbers).toContain(saveNumber);
    });
  });

  describe('verify line selected', () => {
    let member1, memberData, checkboxesList, allNumbers;
    beforeEach(initComponent);
    beforeEach(function() {
      this.controller.memberList = membersList;
      member1 = angular.copy(this.controller.memberList[0]);
      memberData = {
        member: member1,
        picturePath: fake_picture_path,
        checkboxes: checkboxesList,
        saveNumbers: [],
      };
      allNumbers = getJSONFixture('huron/json/features/callPickup/numbersList.json');
    });

    it('should return false if a member doesn\'t have a single line selected ', function() {
      this.controller.selectedMembers.push(memberData);
      expect(this.controller.verifyLineSelected()).toEqual(false);
    });
  });

  describe('get member numbers', () => {
    beforeEach(initComponent);

    it('Should return all the numbers for a member', function() {
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/0001/numbers').respond(200, numbersArray);
      this.controller.getMemberNumbers('0001').then(function (response) {
        expect(response.length).toEqual(9);
      });
      this.$httpBackend.flush();
    });
  });

  describe('member name display test', () => {
    beforeEach(initComponent);

    it('Can getDisplayName', function() {
      let mem5 = angular.copy(membersList[4]);
      expect(this.controller.getDisplayName(mem5)).toEqual('peter@test.com');

      let mem1 = angular.copy(membersList[0]);
      expect(this.controller.getDisplayName(mem1)).toEqual('Chuck Norris (chuck.norris@test.com)');

      let mem2 = angular.copy(membersList[1]);
      expect(this.controller.getDisplayName(mem2)).toEqual('Koala Lounge 1');

      let mem4 = angular.copy(membersList[5]);
      expect(this.controller.getDisplayName(mem4)).toEqual('');

    });

    it('Can getDisplayNameOnCard', function() {
      let mem5 = angular.copy(membersList[4]);
      expect(this.controller.getDisplayNameOnCard(mem5)).toEqual('');

      let mem1 = angular.copy(membersList[0]);
      expect(this.controller.getDisplayNameOnCard(mem1)).toEqual('Chuck Norris');

      let mem2 = angular.copy(membersList[1]);
      expect(this.controller.getDisplayNameOnCard(mem2)).toEqual('Koala Lounge 1');

      let mem3 = undefined;
      expect(this.controller.getDisplayNameOnCard(mem3)).toEqual('');

      let mem = new Member({
        uuid: '0005',
        type: 'USER_PLACE',
        firstName: 'TOM',
        lastName: 'CRUISE',
        userName: undefined,
        displayName: undefined,
        numbers: [],
      });
      expect(this.controller.getDisplayNameOnCard(mem)).toEqual('');
    });
  });

  describe('member type test', () => {
    beforeEach(initComponent);

    it('Can USER_REAL_USER type', function () {
      let mem1 = angular.copy(membersList[0]);
      expect(this.controller.getMemberType(mem1)).toEqual('user');
    });

    it('Can get USER_PLACE type', function() {
      let mem2 = angular.copy(membersList[1]);
      expect(this.controller.getMemberType(mem2)).toEqual('place');
    });
  });
});
