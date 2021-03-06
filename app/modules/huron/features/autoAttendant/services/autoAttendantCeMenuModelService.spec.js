'use strict';

describe('Service: AutoAttendantCeMenuModelService', function () {
  var AutoAttendantCeMenuModelService;
  // require('jasmine-collection-matchers');

  var ceInfos = getJSONFixture('huron/json/autoAttendant/rawCeInfos.json');

  // Welcome menu
  var wmenu = getJSONFixture('huron/json/autoAttendant/welcomeMenu.json');
  var ceWelcome = wmenu.ceWelcome;
  var ceWelcomeNoDescription = wmenu.ceWelcomeNoDescription;
  var ceWelcomeNoDescriptionTemp = wmenu.ceWelcomeNoDescriptionTemp;
  var welcomeMenu = wmenu.welcomeMenu;
  var ceMenuFull = wmenu.ceMenuFull;

  var ceWelcome2 = {
    "callExperienceName": "AA Welcome",
    "assignedResources": [{
      "trigger": "incomingCall",
      "type": "directoryNumber",
      "id": "e7d68d8c-9e92-4330-a881-5fc9ace1f7d3"
    }],
    "defaultActionSet": "openHours",
    "scheduleEventTypeMap": {
      "open": "openHours"
    },
    "actionSets": [{
      "name": "openHours",
      "actions": [{
        "play": {
          "description": "Welcome prompt",
          "url": "file1.avi"
        }
      }]
    }]
  };

  // Combined menu
  var combmenu = getJSONFixture('huron/json/autoAttendant/combinedMenu.json');
  var submenu = getJSONFixture('huron/json/autoAttendant/submenu.json');
  var ceCombined = combmenu.ceCombined;
  var ceCombinedInputWithSubmenu = combmenu.ceCombinedInputWithSubmenu;
  var combinedMenuWithSubmenu = combmenu.combinedMenuWithSubmenu;

  // Option menu
  var omenu = getJSONFixture('huron/json/autoAttendant/optionMenu.json');
  var ceOption = omenu.ceOption;
  var expectedCeOption = omenu.expectedCeOption;
  var ceOptionUnsorted = omenu.ceOptionUnsorted;
  var optionMenu = omenu.optionMenu;

  // Custom menu
  var cmenu = getJSONFixture('huron/json/autoAttendant/customMenu.json');
  var ceCustom = cmenu.ceCustom;
  var customMenu = cmenu.customMenu;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_AutoAttendantCeMenuModelService_) {
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AutoAttendantCeMenuModelService.clearCeMenuMap();
  }));

  afterEach(function () {

  });

  describe('getWelcomeMenu', function () {
    it('should return welcomeMenu from parsing ceWelcome', function () {
      var _welcomeMenu = AutoAttendantCeMenuModelService.getWelcomeMenu(ceWelcome, 'openHours');
      _.each(_.keys(_welcomeMenu), function (key) {
        expect(_.isEqual(welcomeMenu[key], _welcomeMenu[key]));
      });
    });
  });

  describe('getOptionMenu', function () {
    it('should return optionMenu from parsing ceOption', function () {
      var _optionMenu = AutoAttendantCeMenuModelService.getOptionMenu(ceOption, 'openHours');
      _.each(_.keys(_optionMenu), function (key) {
        expect(_.isEqual(optionMenu[key], _optionMenu[key]));
      });
    });
  });

  describe('getCustomMenu', function () {
    it('should return customMenu from parsing ceCustom', function () {
      var _customMenu = AutoAttendantCeMenuModelService.getCustomMenu(ceCustom, 'openHours');
      expect(angular.equals(_customMenu, customMenu)).toBe(true);
    });
  });

  describe('getCombinedMenu', function () {
    it('should be able to read Combined Menu that has submenu', function () {
      var _combinedMenu = AutoAttendantCeMenuModelService.getCombinedMenu(ceCombinedInputWithSubmenu, 'openHours');
      expect(angular.equals(combinedMenuWithSubmenu, _combinedMenu)).toBe(true);
    });
  });

  describe('updateCombinedMenu', function () {
    it('should be able to update a ceRecord with combinedMenu', function () {
      var _ceRecord = angular.copy(ceInfos[0]);
      _ceRecord.callExperienceName = 'AA Combined';
      var _combinedMenu = AutoAttendantCeMenuModelService.getCombinedMenu(ceCombined, 'openHours');
      AutoAttendantCeMenuModelService.updateCombinedMenu(_ceRecord, 'openHours', _combinedMenu);
      expect(angular.equals(_ceRecord, ceCombined)).toBe(true);
    });

    it('should be able to update a ceRecord with submenu that has a Go Back', function () {
      var _ceRecord = angular.copy(ceInfos[0]);
      _ceRecord.callExperienceName = 'AA Combined';
      _ceRecord.assignedResources[0]['id'] = "81005005";
      _ceRecord.assignedResources[0]['number'] = "5005";
      _ceRecord.defaultActionSet = 'openHours';

      var _combinedMenu = AutoAttendantCeMenuModelService.getCombinedMenu(submenu.ceCombinedInputWithSubmenuGoBack, 'openHours');
      AutoAttendantCeMenuModelService.updateCombinedMenu(_ceRecord, 'openHours', _combinedMenu);
      expect(angular.equals(_ceRecord, submenu.ceCombinedWithSubmenuGoBack)).toBe(true);
    });

    it('should be able to update a ceRecord with submenu that has a DialByExt', function () {
      var _ceRecord = angular.copy(ceInfos[0]);
      _ceRecord.callExperienceName = 'AA Combined';
      _ceRecord.assignedResources[0]['id'] = "81005005";
      _ceRecord.assignedResources[0]['number'] = "5005";
      _ceRecord.defaultActionSet = 'openHours';

      var _combinedMenu = AutoAttendantCeMenuModelService.getCombinedMenu(submenu.ceCombinedInputWithSubmenuDialByExt, 'openHours');
      AutoAttendantCeMenuModelService.updateCombinedMenu(_ceRecord, 'openHours', _combinedMenu);
      expect(angular.equals(_ceRecord, submenu.ceCombinedWithSubmenuDialByExt)).toBe(true);
    });
  });

  describe('updateMenu', function () {
    it('should be able to update an ceRecord with welcomeMenu (no description in goto case)', function () {
      var _ceRecord = angular.copy(ceInfos[0]);

      _ceRecord.defaultActionSet = "openHours";
      _ceRecord.scheduleEventTypeMap = {
        open: "openHours"
      };
      _ceRecord.callExperienceName = 'AA Welcome';
      var _welcomeMenu = AutoAttendantCeMenuModelService.getWelcomeMenu(ceWelcomeNoDescription, 'openHours');
      var success = AutoAttendantCeMenuModelService.updateMenu(_ceRecord, 'openHours', _welcomeMenu);

      expect(angular.equals(_ceRecord, ceWelcomeNoDescriptionTemp)).toBe(true);

      expect(success).toBe(true);

    });
  });

  describe('updateMenu', function () {
    it('should be able to update an ceRecord with customMenu', function () {
      var _ceRecord = angular.copy(ceInfos[0]);
      _ceRecord.defaultActionSet = "openHours";
      _ceRecord.scheduleEventTypeMap = {
        open: "openHours"
      };
      _ceRecord.callExperienceName = 'AA Custom';
      var _welcomeMenu = AutoAttendantCeMenuModelService.getWelcomeMenu(ceWelcome, 'openHours');

      // if this splice to removes actions after play .. should be length -1
      _welcomeMenu.entries.splice(1, _welcomeMenu.entries.length - 1);

      var welcomeMenuSuccess = AutoAttendantCeMenuModelService.updateMenu(_ceRecord, 'openHours', _welcomeMenu);
      var _customMenu = AutoAttendantCeMenuModelService.getCustomMenu(ceCustom, 'openHours');
      var customMenuSuccess = AutoAttendantCeMenuModelService.updateMenu(_ceRecord, 'openHours', _customMenu);

      expect(welcomeMenuSuccess).toBe(true);

      expect(customMenuSuccess).toBe(true);
      expect(angular.equals(_ceRecord, ceCustom)).toBe(true);

    });

    it('should be able to update an ceRecord with ceWelcomeMenu', function () {
      var _ceRecord = angular.copy(ceInfos[0]);
      _ceRecord.defaultActionSet = "openHours";
      _ceRecord.scheduleEventTypeMap = {
        open: "openHours"
      };
      _ceRecord.callExperienceName = 'AA Custom';
      var _welcomeMenu = AutoAttendantCeMenuModelService.getWelcomeMenu(ceWelcome, 'openHours');

      // if this splice to removes actions after play .. should be length -1
      var welcomeMenuSuccess = AutoAttendantCeMenuModelService.updateMenu(_ceRecord, 'openHours', _welcomeMenu);
      var _customMenu = AutoAttendantCeMenuModelService.getCustomMenu(ceCustom, 'openHours');
      var customMenuSuccess = AutoAttendantCeMenuModelService.updateMenu(_ceRecord, 'openHours', _customMenu);

      expect(welcomeMenuSuccess).toBe(true);

      expect(customMenuSuccess).toBe(true);
      _.each(_.keys(_ceRecord), function (key) {
        expect(_.isEqual(_ceRecord[key], ceMenuFull[key]));
      });
    });
  });

  describe('updateMenu', function () {
    it('should be able to update an ceRecord with optionMenu', function () {
      var _ceRecord = angular.copy(ceInfos[0]);
      _ceRecord.defaultActionSet = "openHours";
      _ceRecord.scheduleEventTypeMap = {
        open: "openHours"
      };
      _ceRecord.callExperienceName = 'AA Option';
      var _welcomeMenu = AutoAttendantCeMenuModelService.getWelcomeMenu(ceWelcome, 'openHours');

      // if this splice to removes actions after play .. should be length -1
      _welcomeMenu.entries.splice(1, _welcomeMenu.entries.length - 1);
      var welcomeMenuSuccess = AutoAttendantCeMenuModelService.updateMenu(_ceRecord, 'openHours', _welcomeMenu);
      var _optionMenu = AutoAttendantCeMenuModelService.getOptionMenu(ceOption, 'openHours');
      var optionMenuSuccess = AutoAttendantCeMenuModelService.updateMenu(_ceRecord, 'openHours', _optionMenu);
      expect(welcomeMenuSuccess).toBe(true);
      expect(optionMenuSuccess).toBe(true);
      expect(angular.equals(_ceRecord, expectedCeOption)).toBe(true);
    });
  });

  describe('updateMenu', function () {
    it('should be able to update a ceRecord with sorted keys in optionMenu', function () {
      var _ceRecord = angular.copy(ceInfos[0]);
      _ceRecord.defaultActionSet = "openHours";
      _ceRecord.scheduleEventTypeMap = {
        open: "openHours"
      };
      _ceRecord.callExperienceName = 'AA Option';
      var _welcomeMenu = AutoAttendantCeMenuModelService.getWelcomeMenu(ceWelcome, 'openHours');

      // if this splice to removes actions after play .. should be length -1
      _welcomeMenu.entries.splice(1, _welcomeMenu.entries.length - 1);
      var welcomeMenuSuccess = AutoAttendantCeMenuModelService.updateMenu(_ceRecord, 'openHours', _welcomeMenu);
      var _optionMenu = AutoAttendantCeMenuModelService.getOptionMenu(ceOptionUnsorted, 'openHours');
      var optionMenuSuccess = AutoAttendantCeMenuModelService.updateMenu(_ceRecord, 'openHours', _optionMenu);
      expect(welcomeMenuSuccess).toBe(true);
      expect(optionMenuSuccess).toBe(true);
      expect(angular.equals(_ceRecord, expectedCeOption)).toBe(true);
    });
  });

  describe('deleteMenu', function () {
    it('should be able to delete custom menu from a given ceRecord', function () {
      ceWelcome2.callExperienceName = 'AA Custom';
      var _ceRecord = angular.copy(ceCustom);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteMenu(_ceRecord, 'openHours', 'MENU_CUSTOM');
      expect(deleteSuccess).toBe(true);
      expect(angular.equals(_ceRecord, ceWelcome2)).toBe(true);
    });
  });

  describe('deleteMenu', function () {
    it('should be able to delete option menu from a given ceRecord', function () {
      ceWelcome2.callExperienceName = 'AA Option';
      var _ceRecord = angular.copy(ceOption);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteMenu(_ceRecord, 'openHours', 'MENU_OPTION');
      expect(deleteSuccess).toBe(true);
      expect(angular.equals(_ceRecord, ceWelcome2)).toBe(true);
    });
  });

  describe('deleteMenu', function () {
    it('should not succeed if 1st param is null', function () {
      ceWelcome2.callExperienceName = 'AA Option';
      var _ceRecord = angular.copy(ceOption);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteMenu(null, 'openHours', 'MENU_OPTION');
      expect(deleteSuccess).toBe(false);
      expect(angular.equals(_ceRecord, ceWelcome2)).toBe(false);
    });
  });

  describe('deleteMenu', function () {
    it('should not succeed if 1st param is undefined', function () {
      ceWelcome2.callExperienceName = 'AA Option';
      var _ceRecord = angular.copy(ceOption);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteMenu(undefined, 'openHours', 'MENU_OPTION');
      expect(deleteSuccess).toBe(false);
      expect(angular.equals(_ceRecord, ceWelcome2)).toBe(false);
    });
  });

  describe('deleteMenu', function () {
    it('should not succeed if 2nd param is null', function () {
      ceWelcome2.callExperienceName = 'AA Option';
      var _ceRecord = angular.copy(ceOption);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteMenu(_ceRecord, null, 'MENU_OPTION');
      expect(deleteSuccess).toBe(false);
      expect(angular.equals(_ceRecord, ceWelcome2)).toBe(false);
    });
  });

  describe('deleteMenu', function () {
    it('should not succeed if 2nd param is undefined', function () {
      ceWelcome2.callExperienceName = 'AA Option';
      var _ceRecord = angular.copy(ceOption);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteMenu(_ceRecord, undefined, 'MENU_OPTION');
      expect(deleteSuccess).toBe(false);
      expect(angular.equals(_ceRecord, ceWelcome2)).toBe(false);
    });
  });

  describe('deleteMenu', function () {
    it('should not succeed if 3rd param is null', function () {
      ceWelcome2.callExperienceName = 'AA Option';
      var _ceRecord = angular.copy(ceOption);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteMenu(_ceRecord, 'openHours', null);
      expect(deleteSuccess).toBe(false);
      expect(angular.equals(_ceRecord, ceWelcome2)).toBe(false);
    });
  });

  describe('deleteMenu', function () {
    it('should not succeed if 3rd param is undefined', function () {
      ceWelcome2.callExperienceName = 'AA Option';
      var _ceRecord = angular.copy(ceOption);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteMenu(_ceRecord, 'openHours', undefined);
      expect(deleteSuccess).toBe(false);
      expect(angular.equals(_ceRecord, ceWelcome2)).toBe(false);
    });
  });

  describe('deleteCombinedMenu', function () {
    it('should delete associated actionSet in a given ceRecord', function () {
      ceWelcome2.callExperienceName = 'AA Option';
      var _ceRecord = angular.copy(ceOption);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteCombinedMenu(_ceRecord, 'openHours');
      expect(deleteSuccess).toBe(true);
      expect(_ceRecord.actionSets.length).toEqual(0);
    });
  });

  describe('newCeActionEntry', function () {
    it('should have get and set methods defined for each attribute and be cloned successfully', function () {

      // check setter and getter
      var _action = AutoAttendantCeMenuModelService.newCeActionEntry('name', 'value');
      _action.setDescription('description');
      expect(_action.getDescription()).toBe('description');
      expect(_action.getName()).toBe('name');
      expect(_action.getValue()).toBe('value');

      _action.setDescription('description2');
      _action.setName('name2');
      _action.setValue('value2');
      expect(_action.getDescription()).toBe('description2');
      expect(_action.getName()).toBe('name2');
      expect(_action.getValue()).toBe('value2');

      // check clone
      var _action2 = _action.clone();
      expect(angular.equals(_action, _action2)).toBe(true);

      // check clone
      _action2.setDescription('description3');
      expect(angular.equals(_action, _action2)).toBe(false);
    });
  });

  describe('newCeMenuEntry', function () {
    it('should have get and set methods defined for each attribute and be cloned successfully', function () {

      // check setter and getter
      var _menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      _menuEntry.setDescription('menu entry');
      expect(_menuEntry.getDescription()).toBe('menu entry');
      _menuEntry.setType('type');
      expect(_menuEntry.getType()).toBe('type');
      _menuEntry.setKey('7');
      expect(_menuEntry.getKey()).toBe('7');
      _menuEntry.setTimeout('5');
      expect(_menuEntry.getTimeout()).toBe('5');

      var _action = AutoAttendantCeMenuModelService.newCeActionEntry('name1', 'value1');
      _action.setDescription('description1');
      _menuEntry.addAction(_action);
      _action = AutoAttendantCeMenuModelService.newCeActionEntry('name2', 'value2');
      _action.setDescription('description2');
      _menuEntry.addAction(_action);
      expect(_menuEntry.actions.length).toBe(2);

      _menuEntry.setUsername('username');
      expect(_menuEntry.getUsername()).toBe('username');
      _menuEntry.setPassword('password');
      expect(_menuEntry.getPassword()).toBe('password');
      _menuEntry.setUrl('https://abc');
      expect(_menuEntry.getUrl()).toBe('https://abc');

      // check clone
      var _menuEntry2 = _menuEntry.clone();
      expect(angular.equals(_menuEntry, _menuEntry2)).toBe(true);

      // check that clone return a separate instance
      _menuEntry2.setUrl('https://abc2');
      expect(angular.equals(_menuEntry, _menuEntry2)).toBe(false);
    });
  });

  describe('newCeMenu', function () {
    it('should return an object of type CeMenu', function () {
      var _ceMenu = AutoAttendantCeMenuModelService.newCeMenu();
      _ceMenu.setType('MENU_OPTION');
      _ceMenu.addHeader(AutoAttendantCeMenuModelService.newCeMenuEntry());
      _ceMenu.addEntry(AutoAttendantCeMenuModelService.newCeMenuEntry());
      expect(_ceMenu.getType()).toBe('MENU_OPTION');
      expect(_ceMenu.headers.length).toBe(1);
      expect(_ceMenu.entries.length).toBe(1);
      expect(_ceMenu.id).toBe('menu0');
      expect(AutoAttendantCeMenuModelService.isCeMenu(_ceMenu)).toBe(true);
    });

    it('should return a new CeMenu object on each call', function () {
      var _ceMenu = AutoAttendantCeMenuModelService.newCeMenu();
      expect(_ceMenu.id).toBe('menu0');
      _ceMenu = AutoAttendantCeMenuModelService.newCeMenu();
      expect(_ceMenu.id).toBe('menu1');
      _ceMenu = AutoAttendantCeMenuModelService.newCeMenu();
      expect(_ceMenu.id).toBe('menu2');
    });
  });

  describe('clearCeMenuMap', function () {
    it('should reset the CeMenu internal count to 0', function () {
      var _ceMenu = AutoAttendantCeMenuModelService.newCeMenu();
      expect(_ceMenu.id).toBe('menu0');
      _ceMenu = AutoAttendantCeMenuModelService.newCeMenu();
      expect(_ceMenu.id).toBe('menu1');
      AutoAttendantCeMenuModelService.clearCeMenuMap();
      _ceMenu = AutoAttendantCeMenuModelService.newCeMenu();
      expect(_ceMenu.id).toBe('menu0');
    });
  });

  describe('getCeMenu', function () {
    it('should return the CeMenu with the given menuId', function () {
      AutoAttendantCeMenuModelService.newCeMenu();
      AutoAttendantCeMenuModelService.newCeMenu();
      AutoAttendantCeMenuModelService.newCeMenu();
      expect(AutoAttendantCeMenuModelService.getCeMenu('menu0').id).toBe('menu0');
      expect(AutoAttendantCeMenuModelService.getCeMenu('menu1').id).toBe('menu1');
      expect(AutoAttendantCeMenuModelService.getCeMenu('menu2').id).toBe('menu2');
    });
  });

  describe('deleteCeMenuMap', function () {
    it('should remove the given menu and all of its submenus from the CeMenuMap', function () {
      var _ceMenu0 = AutoAttendantCeMenuModelService.newCeMenu();
      var _ceMenu1 = AutoAttendantCeMenuModelService.newCeMenu();
      var _ceMenu2 = AutoAttendantCeMenuModelService.newCeMenu();
      _ceMenu0.addEntry(_ceMenu1);
      _ceMenu0.addEntry(_ceMenu2);
      expect(AutoAttendantCeMenuModelService.getCeMenu('menu0').id).toBe('menu0');
      expect(AutoAttendantCeMenuModelService.getCeMenu('menu1').id).toBe('menu1');
      expect(AutoAttendantCeMenuModelService.getCeMenu('menu2').id).toBe('menu2');
      AutoAttendantCeMenuModelService.deleteCeMenuMap('menu0');
      expect(AutoAttendantCeMenuModelService.getCeMenu('menu0')).toBe(undefined);
      expect(AutoAttendantCeMenuModelService.getCeMenu('menu1')).toBe(undefined);
      expect(AutoAttendantCeMenuModelService.getCeMenu('menu2')).toBe(undefined);
    });
  });

  describe('updateScheduleActionSetMap', function () {
    it('should set scheduleActionSetMap attributes in AARecord object', function () {
      var _ceRecord = {};
      AutoAttendantCeMenuModelService.updateScheduleActionSetMap(_ceRecord, 'openHours');
      expect(!_.isUndefined(_ceRecord.scheduleEventTypeMap)).toBe(true);
      expect(_ceRecord.scheduleEventTypeMap.open).toBe('openHours');

      _ceRecord = {};
      AutoAttendantCeMenuModelService.updateScheduleActionSetMap(_ceRecord, 'closedHours');
      expect(!_.isUndefined(_ceRecord.scheduleEventTypeMap)).toBe(true);
      expect(_ceRecord.scheduleEventTypeMap.closed).toBe('closedHours');

      _ceRecord = {};
      AutoAttendantCeMenuModelService.updateScheduleActionSetMap(_ceRecord, 'holidays', 'closedHours');
      expect(!_.isUndefined(_ceRecord.scheduleEventTypeMap)).toBe(true);
      expect(_ceRecord.scheduleEventTypeMap.holiday).toBe('closedHours');
    });
  });

  describe('updateDefaultActionSet', function () {
    it('should set defaultActionSet to closedHours in AARecord object', function () {
      var _ceRecord = {};
      AutoAttendantCeMenuModelService.updateDefaultActionSet(_ceRecord, true);
      expect(_ceRecord.defaultActionSet).toBe('closedHours');
    });

    it('should set defaultActionSet to openHours in AARecord object', function () {
      var _ceRecord = {};
      AutoAttendantCeMenuModelService.updateDefaultActionSet(_ceRecord, false);
      expect(_ceRecord.defaultActionSet).toBe('openHours');
    });

    it('should set defaultActionSet to openHours in AARecord object with hasClosedHours undefined', function () {
      var _ceRecord = {};
      AutoAttendantCeMenuModelService.updateDefaultActionSet(_ceRecord, undefined);
      expect(_ceRecord.defaultActionSet).toBe('openHours');
    });

    it('should not change defaultActionSet', function () {
      var _ceRecord = {
        defaultActionSet: 'test'
      };
      AutoAttendantCeMenuModelService.updateDefaultActionSet(_ceRecord, undefined);
      expect(_ceRecord.defaultActionSet).toBe('test');
    });
  });

  describe('deleteScheduleActionSetMap', function () {
    it('should delete defaultActionSet and associated scheduleEventTypeMap attribute in AARecord object', function () {
      var _ceRecord = {
        defaultActionSet: 'closedHours',
        scheduleEventTypeMap: {
          open: 'openHours',
          closed: 'closedHours',
          holiday: 'holidays'
        }
      };
      AutoAttendantCeMenuModelService.deleteScheduleActionSetMap(_ceRecord, 'closedHours');
      expect(_.isUndefined(_ceRecord.scheduleEventTypeMap.closed)).toBe(true);

      AutoAttendantCeMenuModelService.deleteScheduleActionSetMap(_ceRecord, 'openHours');
      expect(_.isUndefined(_ceRecord.scheduleEventTypeMap.open)).toBe(true);

      AutoAttendantCeMenuModelService.deleteScheduleActionSetMap(_ceRecord, 'holidays');
      expect(_.isUndefined(_ceRecord.scheduleEventTypeMap.holiday)).toBe(true);
    });
  });
});
