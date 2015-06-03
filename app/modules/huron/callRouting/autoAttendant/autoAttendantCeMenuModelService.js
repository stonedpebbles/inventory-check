(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AutoAttendantCeMenuModelService', AutoAttendantCeMenuModelService);

  //
  // Data model derived from the AA Json data
  //
  // AAModel
  //     aaRecord
  //         callExperienceName
  //         assignedResources[]
  //         actionSets[]
  //
  //     aaResourceRecord
  //         callExperienceName
  //         assignedResources[]
  //         callExperienceURL
  //
  function AARecord() {
    this.callExperienceName = "";
    this.assignedResources = [];
    this.actionSets = [];
  }

  function AAModel() {
    this.aaRecord = new AARecord();
    this.aaRecords = [];
  }

  //
  // UI model:
  //
  // Customer
  //     CEInfo[]
  //         CEInfo
  //             name
  //             Resources[]
  //                 Resource
  //                     id: uuid
  //                     trigger: 'inComing', 'outGoing'
  //                     type: 'directoryNumber'
  //                     number: 'E164'
  //             Menu
  //
  // Menu
  //     menuEntry
  //         description
  //         type
  //         username
  //         password
  //         url
  //         headers[]
  //             action
  //                 name
  //                 value
  //                 description
  //         entries[]
  //             action
  //                 name
  //                 value
  //                 description
  //
  function Action(name, value) {
    this.name = name;
    this.value = value;
    this.description = '';
  }

  Action.prototype.clone = function () {
    var newObj = new Action(this.name, this.value);
    newObj.setDescription(this.description);
    return newObj;
  };

  Action.prototype.getName = function () {
    return this.name;
  };

  Action.prototype.setName = function (name) {
    this.name = name;
  };

  Action.prototype.getValue = function () {
    return this.value;
  };

  Action.prototype.setValue = function (value) {
    this.value = value;
  };

  Action.prototype.setDescription = function (description) {
    this.description = description;
  };

  Action.prototype.getDescription = function () {
    return this.description;
  };

  function CeMenuEntry() {
    //
    // common
    //
    // properties:
    this.description = '';
    this.isConfigured = true;
    this.type = '';

    //
    // welcome menu entry
    // option menu entry
    //
    // properties:
    this.key = '';
    this.actions = [];
    this.timeout = '';

    //
    // custom menu entry
    //
    // properties:
    this.username = '';
    this.password = '';
    this.url = '';
  }

  CeMenuEntry.prototype.clone = function () {
    var newObj = new CeMenuEntry();
    newObj.setDescription(this.description);
    newObj.setType(this.type);
    newObj.setIsConfigured(this.isConfigured);

    newObj.setKey(this.key);
    for (var i = 0; i < this.actions.length; i++) {
      newObj.actions[i] = this.actions[i].clone();
    }
    newObj.setTimeout(this.timeout);

    newObj.setUsername(this.username);
    newObj.setPassword(this.password);
    newObj.setUrl(this.url);

    return newObj;
  };

  CeMenuEntry.prototype.setDescription = function (description) {
    this.description = description;
  };

  CeMenuEntry.prototype.getDescription = function () {
    return this.description;
  };

  CeMenuEntry.prototype.setType = function (type) {
    this.type = type;
  };

  CeMenuEntry.prototype.getType = function () {
    return this.type;
  };

  CeMenuEntry.prototype.setIsConfigured = function (isConfigured) {
    this.isConfigured = isConfigured;
  };

  CeMenuEntry.prototype.setKey = function (key) {
    this.key = key;
  };

  CeMenuEntry.prototype.getKey = function () {
    return this.key;
  };

  CeMenuEntry.prototype.addAction = function (action) {
    this.actions.push(action);
  };

  CeMenuEntry.prototype.setTimeout = function (timeout) {
    this.timeout = timeout;
  };

  CeMenuEntry.prototype.getTimeout = function () {
    return this.timeout;
  };

  CeMenuEntry.prototype.setPassword = function (password) {
    this.password = password;
  };

  CeMenuEntry.prototype.getPassword = function () {
    return this.password;
  };

  CeMenuEntry.prototype.setUsername = function (username) {
    this.username = username;
  };

  CeMenuEntry.prototype.getUsername = function () {
    return this.username;
  };

  CeMenuEntry.prototype.setUrl = function (url) {
    this.url = url;
  };

  CeMenuEntry.prototype.getUrl = function () {
    return this.url;
  };

  function CeMenu() {
    this.type = '';
    this.headers = [];
    this.entries = [];
  }

  CeMenu.prototype.setType = function (menuType) {
    this.type = menuType;
  };

  CeMenu.prototype.getType = function () {
    return this.type;
  };

  CeMenu.prototype.addHeader = function (entry) {
    this.headers.push(entry);
  };

  CeMenu.prototype.addEntry = function (entry) {
    this.entries.push(entry);
  };

  function MainMenu() {
    this.description = '';
    this.prompts = {};
    this.timeoutInSeconds = 30;
    this.inputs = [];
  }

  function CustomAction() {
    this.description = '';
    this.username = '';
    this.password = '';
    this.url = '';
  }

  /* @ngInject */
  function AutoAttendantCeMenuModelService() {

    var service = {
      getWelcomeMenu: getWelcomeMenu,
      getCustomMenu: getCustomMenu,
      getOptionMenu: getOptionMenu,
      updateMenu: updateMenu,
      deleteMenu: deleteMenu,

      newCeMenu: function () {
        return new CeMenu();
      },

      newCeMenuEntry: function () {
        return new CeMenuEntry();
      },

      newCeActionEntry: function (name, value) {
        return new Action(name, value);
      },

      newAAModel: function () {
        return new AAModel();
      },

      newAARecord: function () {
        return new AARecord();
      }
    };

    return service;

    /////////////////////

    function parseObject(menuEntry, inObject) {
      var action;
      // convert file url to unique filename
      // var filename = MediaResourceService.getFileName(inObject.url);
      action = new Action('play', inObject.url);
      if (angular.isDefined(inObject.description)) {
        action.setDescription(inObject.description);
      }
      menuEntry.addAction(action);
    }

    function parsePlayList(menuEntry, objects) {
      for (var i = 0; i < objects.length; i++) {
        parseObject(menuEntry, objects[i]);
      }
    }

    function createPlayList(actions) {
      var newActionArray = [];
      for (var i = 0; i < actions.length; i++) {
        newActionArray[i] = {};
        var val = actions[i].getValue();
        // convert unique filename to corresponding URL
        // newActionArray[i].url = MediaResourceService.getFileUrl(val);
        newActionArray[i].url = val;

        if (angular.isDefined(actions[i].description) && actions[i].description.length > 0) {
          newActionArray[i].description = actions[i].description;
        }
      }
      return newActionArray;
    }

    function parseAction(menuEntry, inAction) {
      var action;
      if (angular.isDefined(inAction.play)) {
        // convert file url to unique filename
        // var filename = MediaResourceService.getFileName(inAction.play.url);
        action = new Action('play', inAction.play.url);
        if (angular.isDefined(inAction.play.description)) {
          action.setDescription(inAction.play.description);
        }
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.route)) {
        action = new Action('route', inAction.route.destination);
        if (angular.isDefined(inAction.route.description)) {
          action.setDescription(inAction.route.description);
        }
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.routeToMailbox)) {
        action = new Action('routeToMailbox', inAction.routeToMailbox.mailbox);
        if (angular.isDefined(inAction.routeToMailbox.description)) {
          action.setDescription(inAction.routeToMailbox.description);
        }
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.repeatActionsOnInput)) {
        action = new Action('repeatActionsOnInput', '');
        if (angular.isDefined(inAction.repeatActionsOnInput.description)) {
          action.setDescription(inAction.repeatActionsOnInput.description);
        }
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.routeToCollectedNumber)) {
        action = new Action('routeToCollectedNumber', '');
        if (angular.isDefined(inAction.routeToCollectedNumber.description)) {
          action.setDescription(inAction.routeToCollectedNumber.description);
        }
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.routeToDialedMailbox)) {
        action = new Action('routeToDialedMailbox', '');
        if (angular.isDefined(inAction.routeToDialedMailbox.description)) {
          action.setDescription(inAction.routeToDialedMailbox.description);
        }
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.disconnect)) {
        action = new Action('disconnect', '');
        if (angular.isDefined(inAction.disconnect.description)) {
          action.setDescription(inAction.disconnect.description);
        }
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.routeToDialed)) {
        action = new Action('routeToDialed', '');
        if (angular.isDefined(inAction.routeToDialed.description)) {
          action.setDescription(inAction.routeToDialed.description);
        }
        menuEntry.addAction(action);
      } else {
        // insert an empty action
        action = new Action('', '');
        if (angular.isDefined(inAction.description)) {
          action.setDescription(inAction.description);
        }
        menuEntry.addAction(action);
      }
    }

    function parseActions(menuEntry, actions) {
      for (var i = 0; i < actions.length; i++) {
        parseAction(menuEntry, actions[i]);
      }
    }

    function getWelcomeMenu(ceRecord, actionSetName) {

      if (angular.isUndefined(ceRecord) || angular.isUndefined(actionSetName)) {
        return undefined;
      }

      var actionSet = getActionSet(ceRecord, actionSetName);
      if (angular.isUndefined(actionSet)) {
        return undefined;
      }

      if (angular.isUndefined(actionSet.actions)) {
        return undefined;
      }
      var ceActionArray = actionSet.actions;

      var menu = new CeMenu();
      menu.setType('MENU_WELCOME');

      for (var i = 0; i < ceActionArray.length; i++) {
        if (angular.isUndefined(ceActionArray[i].runActionsOnInput) && angular.isUndefined(ceActionArray[i].runCustomActions)) {
          var menuEntry = new CeMenuEntry();
          parseAction(menuEntry, ceActionArray[i]);
          menu.addEntry(menuEntry);
        }
      }

      return menu;
    }

    /*
     */
    function getOptionMenu(ceRecord, actionSetName) {

      if (angular.isUndefined(ceRecord) || angular.isUndefined(actionSetName)) {
        return undefined;
      }

      var actionSet = getActionSet(ceRecord, actionSetName);
      if (angular.isUndefined(actionSet)) {
        return undefined;
      }

      if (angular.isUndefined(actionSet.actions)) {
        return undefined;
      }
      var ceActionArray = actionSet.actions;
      //
      // aaActionArray is actionSet['regularOpenActions'],
      // makes up of welcome menu's action objects, main menu object and custom menu object.
      // mainMenu is refered to as OPTION menu in the UI.
      //
      var i = getActionIndex(ceActionArray, 'runActionsOnInput');
      if (i >= 0) {
        var menu = new CeMenu();
        menu.setType('MENU_OPTION');
        var ceActionsOnInput = ceActionArray[i].runActionsOnInput;
        var menuEntry;

        // Collect the accouncement header
        var announcementMenuEntry = new CeMenuEntry();
        announcementMenuEntry.setType('MENU_OPTION_ANNOUNCEMENT');
        menu.addHeader(announcementMenuEntry);
        if (angular.isDefined(ceActionsOnInput.prompts)) {
          if (angular.isDefined(ceActionsOnInput.prompts.description)) {
            announcementMenuEntry.setDescription(ceActionsOnInput.prompts.description);
          }
          if (angular.isDefined(ceActionsOnInput.prompts.playList)) {
            parsePlayList(announcementMenuEntry, ceActionsOnInput.prompts.playList);
          }
        }

        // Collect default handling actions
        var defaultMenuEntry = new CeMenuEntry();
        defaultMenuEntry.setType('MENU_OPTION_DEFAULT');
        menu.addHeader(defaultMenuEntry);

        // Collect timeout handling actions
        var timeoutMenuEntry = new CeMenuEntry();
        timeoutMenuEntry.setType('MENU_OPTION_TIMEOUT');
        timeoutMenuEntry.setTimeout(ceActionsOnInput.timeoutInSeconds || 10);

        // Collect the main menu's options
        if (angular.isDefined(ceActionsOnInput.inputs)) {
          for (var j = 0; j < ceActionsOnInput.inputs.length; j++) {
            var menuOption = ceActionsOnInput.inputs[j];
            if (angular.isDefined(menuOption.input) && menuOption.input === 'default') {
              defaultMenuEntry.setDescription(menuOption.description || '');
              parseActions(defaultMenuEntry, menuOption.actions);
            } else if (angular.isDefined(menuOption.input) && menuOption.input === 'timeout') {
              timeoutMenuEntry.setDescription(menuOption.description || '');
              parseActions(timeoutMenuEntry, menuOption.actions);
              // do not expose timeout entry by default
              menu.addHeader(timeoutMenuEntry);
            } else {
              menuEntry = new CeMenuEntry();
              menuEntry.setType('MENU_OPTION');
              menuEntry.setDescription(menuOption.description || '');
              menuEntry.setKey(menuOption.input || '');
              parseActions(menuEntry, menuOption.actions);
              menu.addEntry(menuEntry);
            }
          }
          return menu;
        }
      }

      return undefined;
    }

    function getCustomMenu(ceRecord, actionSetName) {

      if (angular.isUndefined(ceRecord) || angular.isUndefined(actionSetName)) {
        return undefined;
      }

      var actionSet = getActionSet(ceRecord, actionSetName);
      if (angular.isUndefined(actionSet)) {
        return undefined;
      }

      if (angular.isUndefined(actionSet.actions)) {
        return undefined;
      }

      var ceActionArray = actionSet.actions;

      var i = getActionIndex(ceActionArray, 'runCustomActions');

      if (i >= 0) {
        var menu = new CeMenu();
        menu.setType('MENU_CUSTOM');

        var ceCustomActions = ceActionArray[i];
        var menuEntry = new CeMenuEntry();
        for (var attr in ceCustomActions.runCustomActions) {
          menuEntry[attr] = ceCustomActions.runCustomActions[attr];
        }
        menu.addEntry(menuEntry);
        return menu;
      }

      return undefined;
    }

    /*
     * getActionIndex return the index to the given actionName in actionArray.
     *
     * actionArray: array of actions.
     * actionName: 'play', 'route', etc.
     */
    function getActionIndex(actionArray, actionName) {
      if (angular.isUndefined(actionArray) || actionArray === null) {
        return -1;
      }

      if (angular.isUndefined(actionName) || actionName === null) {
        return -1;
      }

      if (!angular.isArray(actionArray)) {
        return -1;
      }

      for (var i = 0; i < actionArray.length; i++) {
        if (angular.isDefined(actionArray[i][actionName])) {
          return i;
        }
      }
      // No Custom Menu found
      return -1;
    }

    function getActionObject(actionArray, actionName) {
      var i = getActionIndex(actionArray, actionName);
      if (i >= 0) {
        return actionArray[i];
      }
      return undefined;
    }

    /*
     * Walk the ceRecord and return the actionSet actionSetName.
     */
    function getActionSet(ceRecord, actionSetName) {
      if (!angular.isArray(ceRecord.actionSets)) {
        return undefined;
      }
      for (var i = 0; i < ceRecord.actionSets.length; i++) {
        if (angular.isDefined(ceRecord.actionSets[i].name) && ceRecord.actionSets[i].name === actionSetName) {
          return ceRecord.actionSets[i];
        }
      }
      return undefined;
    }

    /*
     * Walk the ceRecord and return the given actionSet actionSetName if found.
     * Construct and return one if not found.
     */
    function getAndCreateActionSet(ceRecord, actionSetName) {
      if (angular.isUndefined(ceRecord.actionSets)) {
        ceRecord.actionSets = [];
      }

      var actionSet = getActionSet(ceRecord, actionSetName);
      if (angular.isUndefined(actionSet)) {
        var i = ceRecord.actionSets.length;
        // add new actionSetName into actions array
        ceRecord.actionSets[i] = {};
        ceRecord.actionSets[i].name = actionSetName;
        ceRecord.actionSets[i].actions = [];
        actionSet = ceRecord.actionSets[i];
      }

      return actionSet;
    }

    function updateCustomMenu(ceRecord, actionSetName, aaMenu) {
      var funcname = 'updateCustomMenu';

      // $log.log(funcname + ': ceRecord: ' + JSON.stringify(ceRecord));
      // $log.log(funcname + ': aaMenu: ' + JSON.stringify(aaMenu));
      if (angular.isUndefined(aaMenu.type) || aaMenu.type !== 'MENU_CUSTOM') {
        return false;
      }

      var actionSet = getAndCreateActionSet(ceRecord, actionSetName);

      var customAction = getActionObject(actionSet.actions, 'runCustomActions');
      if (angular.isUndefined(customAction)) {
        var i = actionSet.actions.length;
        actionSet.actions[i] = {};
        actionSet.actions[i].runCustomActions = new CustomAction();
        customAction = actionSet.actions[i];
      }

      for (var attr in customAction['runCustomActions']) {
        customAction['runCustomActions'][attr] = aaMenu.entries[0][attr];
      }
      // $log.log(funcname + ': ceRecord: ' + JSON.stringify(ceRecord));
      return true;
    }

    function createWelcomeMenu(aaActionArray, aaMenu) {
      var newActionArray = [];
      for (var i = 0; i < aaMenu.entries.length; i++) {
        var menuEntry = aaMenu.entries[i];
        newActionArray[i] = {};
        var actionName = menuEntry.actions[0].getName();
        newActionArray[i][actionName] = {};
        if (angular.isDefined(menuEntry.actions[0].description) && menuEntry.actions[0].description.length > 0) {
          newActionArray[i][actionName].description = menuEntry.actions[0].description;
        }
        if (actionName === 'play') {
          newActionArray[i][actionName].url = menuEntry.actions[0].getValue();
          // newActionArray[i][actionName].url = MediaResourceService.getFileUrl(menuEntry.actions[0].getValue());
        } else if (actionName === 'route') {
          newActionArray[i][actionName].destination = menuEntry.actions[0].getValue();
        } else if (actionName === 'routeToMailbox') {
          newActionArray[i][actionName].mailbox = menuEntry.actions[0].getValue();
        }
      }
      var len = aaActionArray.length;
      if (len > 0) {
        // if there is a custom menu or a main menu at the end of the action array,
        // retain it and copy over.
        if (angular.isDefined(aaActionArray[len - 1].runCustomActions) || angular.isDefined(aaActionArray[len - 1].runActionsOnInput)) {
          newActionArray.push(aaActionArray[len - 1]);
        }
      }
      return newActionArray;
    }

    function updateWelcomeMenu(ceRecord, actionSetName, aaMenu) {
      if (angular.isUndefined(aaMenu.type) || aaMenu.type !== 'MENU_WELCOME') {
        return false;
      }

      if (angular.isUndefined(ceRecord.actionSets)) {
        ceRecord.actionSets = [];
      }

      var actionSet = getAndCreateActionSet(ceRecord, actionSetName);
      actionSet.actions = createWelcomeMenu(actionSet.actions, aaMenu);

      return true;
    }

    function createActionArray(actions) {
      var newActionArray = [];
      for (var i = 0; i < actions.length; i++) {
        newActionArray[i] = {};
        var actionName = actions[i].getName();
        var val = actions[i].getValue();
        newActionArray[i][actionName] = {};
        if (actionName === 'play') {
          // convert unique filename to corresponding URL
          newActionArray[i][actionName].url = val;
          // newActionArray[i][actionName].url = MediaResourceService.getFileUrl(val);
        } else if (actionName === 'route') {
          newActionArray[i][actionName].destination = val;
        } else if (actionName === 'routeToMailbox') {
          newActionArray[i][actionName].mailbox = val;
        }
        if (angular.isDefined(actions[i].description) && actions[i].description.length > 0) {
          newActionArray[i][actionName].description = actions[i].description;
        }
      }
      return newActionArray;
    }

    /*
     * Read aaMenu and populate mainMenu object
     */
    function createOptionMenu(inputAction, aaMenu) {

      // create menuOptions section
      var newOptionArray = [];
      var menuEntry;

      for (var i = 0; i < aaMenu.entries.length; i++) {
        menuEntry = aaMenu.entries[i];
        newOptionArray[i] = {};
        newOptionArray[i].description = menuEntry.description;
        newOptionArray[i].input = menuEntry.key;
        newOptionArray[i].actions = createActionArray(menuEntry.actions);
      }

      // create prompts section
      menuEntry = aaMenu.headers[0];
      inputAction.prompts = {};
      inputAction.prompts.description = menuEntry.description;
      inputAction.prompts.playList = createPlayList(menuEntry.actions);

      // create default action
      i = aaMenu.entries.length;
      menuEntry = aaMenu.headers[1];
      newOptionArray[i] = {};
      newOptionArray[i].description = menuEntry.description;
      newOptionArray[i].input = 'default';
      newOptionArray[i].actions = createActionArray(menuEntry.actions);

      // create timeout section
      // i = aaMenu.entries.length;
      // menuEntry = aaMenu.headers[2];
      // newOptionArray[i] = {};
      // newOptionArray[i].description = menuEntry.description;
      // newOptionArray[i].input = 'timeout';
      // newOptionArray[i].actions = createActionArray(menuEntry.actions);
      // inputAction.timeoutInSeconds = menuEntry.getTimeout();

      inputAction.inputs = newOptionArray;
    }

    function updateOptionMenu(ceRecord, actionSetName, aaMenu) {
      if (angular.isUndefined(aaMenu.type) || aaMenu.type !== 'MENU_OPTION') {
        return false;
      }

      var actionSet = getAndCreateActionSet(ceRecord, actionSetName);
      var inputAction = getActionObject(actionSet.actions, 'runActionsOnInput');
      if (angular.isUndefined(inputAction)) {
        var i = actionSet.actions.length;
        actionSet.actions[i] = {};
        actionSet.actions[i].runActionsOnInput = new MainMenu();
        inputAction = actionSet.actions[i];
      }
      createOptionMenu(inputAction.runActionsOnInput, aaMenu);

      return true;
    }

    function updateMenu(ceRecord, actionSetName, aaMenu) {
      if (angular.isUndefined(aaMenu.type) || aaMenu.type === null) {
        return false;
      }
      if (aaMenu.type === 'MENU_CUSTOM') {
        return updateCustomMenu(ceRecord, actionSetName, aaMenu);
      }
      if (aaMenu.type == 'MENU_WELCOME') {
        return updateWelcomeMenu(ceRecord, actionSetName, aaMenu);
      }
      if (aaMenu.type == 'MENU_OPTION') {
        return updateOptionMenu(ceRecord, actionSetName, aaMenu);
      }
      return false;
    }

    /*
     * actionSetName: 'regularOpenActions'
     * aaMenuType: 'MENU_CUSTOM', 'MENU_MAIN'
     * ceRecord: a customer AA record
     */
    function deleteMenu(ceRecord, actionSetName, aaMenuType) {

      if (angular.isUndefined(actionSetName) || actionSetName === null) {
        return false;
      }

      if (angular.isUndefined(aaMenuType) || aaMenuType === null) {
        return false;
      }

      if (angular.isUndefined(ceRecord) || ceRecord === null) {
        return false;
      }

      // get the action object of actionSetName
      //
      var actionSet = getActionSet(ceRecord, actionSetName);
      if (angular.isUndefined(actionSet)) {
        return false;
      }

      if (angular.isUndefined(actionSet.actions)) {
        return false;
      }

      var aaActionArray = actionSet.actions;
      var i = -1;
      if (aaMenuType === 'MENU_CUSTOM') {
        i = getActionIndex(aaActionArray, 'runCustomActions');
      }

      if (aaMenuType === 'MENU_OPTION') {
        i = getActionIndex(aaActionArray, 'runActionsOnInput');
      }

      if (i >= 0) {
        aaActionArray.splice(i, 1);
        return true;
      }
      return false;
    }
  }
})();