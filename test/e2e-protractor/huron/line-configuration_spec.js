'use strict';

describe('Telephony Info', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  var currentUser, token;
  var user = utils.randomTestGmail();
  var dropdownVariables = {
    'voicemail': 'Voicemail',
    'addNew': 'Add New'
  };
  var snrLine = telephony.getRandomNumber();
  var externalCFLine = telephony.getRandomNumber();

  it('should login', function () {
    login.login('huron-int1');
  });

  it('should retrieve a token', function (done) {
    utils.retrieveToken().then(function (_token) {
      token = _token;
      done();
    });
  });

  it('clicking on users tab should change the view', function () {
    navigation.clickUsers();
  });

  it('should create user', function () {
    utils.click(users.addUsers);
    utils.click(users.addUsersField);
    utils.sendKeys(users.addUsersField, user);
    utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
    utils.click(users.nextButton);
    utils.click(users.advancedCommunications);
    utils.click(users.onboardButton);
    notifications.assertSuccess(user, 'onboarded successfully');
    utils.click(users.closeAddUsers);

  });

  it('should verify added user', function (done) {
    utils.searchAndClick(user).then(function () {
      users.retrieveCurrentUser().then(function (_currentUser) {
        currentUser = _currentUser;
        done();
      });
    });
  });

  it('should open the communcations panel', function () {
    utils.expectIsDisplayed(users.servicesPanel);
    utils.click(users.communicationsService);
    utils.expectIsDisplayed(telephony.communicationPanel);
  });

  describe('Directory Numbers', function () {
    it('should have a primary directory number', function () {
      utils.expectIsDisplayed(telephony.directoryNumbers.first());
      utils.expectCount(telephony.directoryNumbers, 1);
    });

    it('should show directory number select', function () {
      utils.click(telephony.directoryNumbers.first());
      utils.expectIsDisplayed(telephony.internalNumber);
    });

    it('should show ESN number', function () {
      utils.expectIsDisplayed(telephony.esnTail);
      telephony.retrieveInternalNumber().then(function (number) {
        utils.expectText(telephony.esnTail, number);
      });
    });

    it('should not display remove button for primary line', function () {
      utils.expectIsNotDisplayed(telephony.lineConfigurationActionButton);
    });

    it('should save call forward all to an outside number', function () {
      utils.click(telephony.forwardAllRadio);
      telephony.selectOption(telephony.forwardAll, dropdownVariables.addNew);
      telephony.setNumber(telephony.forwardAll, snrLine);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.clickLastBreadcrumb();
      utils.click(telephony.directoryNumbers.first());

      utils.expectInputValue(telephony.forwardAll, snrLine);
    });

    xit('should save call forward all to voicemail', function () {
      utils.click(telephony.forwardAllRadio);
      utils.expectIsDisplayed(telephony.forwardAll);
      utils.expectIsNotDisplayed(telephony.forwardBusyNoAnswer);
      utils.expectIsNotDisplayed(telephony.forwardExternalCalls);
      telephony.selectOption(telephony.forwardAll, dropdownVariables.voicemail);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.clickLastBreadcrumb();
      utils.click(telephony.directoryNumbers.first());

      utils.expectIsDisplayed(telephony.forwardAll);
      utils.expectIsNotDisplayed(telephony.forwardBusyNoAnswer);
      utils.expectInputValue(telephony.forwardAll, dropdownVariables.voicemail);
    });

    it('should save call forward busy/no answer to an outside number', function () {
      utils.click(telephony.forwardBusyNoAnswerRadio);

      utils.expectIsNotDisplayed(telephony.forwardAll);
      utils.expectIsDisplayed(telephony.forwardBusyNoAnswer);
      utils.expectIsDisplayed(telephony.forwardExternalCalls);

      telephony.selectOption(telephony.forwardBusyNoAnswer, dropdownVariables.addNew);
      telephony.setNumber(telephony.forwardBusyNoAnswer, snrLine);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.clickLastBreadcrumb();
      utils.click(telephony.directoryNumbers.first());

      utils.expectIsNotDisplayed(telephony.forwardAll);
      utils.expectIsDisplayed(telephony.forwardBusyNoAnswer);
      utils.expectIsDisplayed(telephony.forwardExternalCalls);
      utils.expectInputValue(telephony.forwardBusyNoAnswer, snrLine);
    });

    xit('should save call forward busy/no answer to voicemail', function () {
      utils.click(telephony.forwardBusyNoAnswerRadio);
      utils.expectIsNotDisplayed(telephony.forwardAll);
      utils.expectIsDisplayed(telephony.forwardBusyNoAnswer);
      utils.expectIsDisplayed(telephony.forwardExternalCalls);

      telephony.selectOption(telephony.forwardBusyNoAnswer, dropdownVariables.voicemail);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.clickLastBreadcrumb();
      utils.click(telephony.directoryNumbers.first());

      utils.expectIsNotDisplayed(telephony.forwardAll);
      utils.expectIsDisplayed(telephony.forwardBusyNoAnswer);
      utils.expectIsDisplayed(telephony.forwardExternalCalls);
      utils.expectInputValue(telephony.forwardBusyNoAnswer, dropdownVariables.voicemail);
    });

    it('should save external call forwarding to an outside number', function () {
      utils.click(telephony.forwardBusyNoAnswerRadio);
      utils.click(telephony.forwardExternalCalls);

      telephony.selectOption(telephony.forwardExternalBusyNoAnswer, dropdownVariables.addNew);
      telephony.setNumber(telephony.forwardExternalBusyNoAnswer, externalCFLine);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.clickLastBreadcrumb();
      utils.click(telephony.directoryNumbers.first());

      utils.expectInputValue(telephony.forwardExternalBusyNoAnswer, externalCFLine);
    });

    xit('should save external call forwarding to voicemail', function () {
      utils.click(telephony.forwardBusyNoAnswerRadio);
      utils.expectIsNotDisplayed(telephony.forwardExternalBusyNoAnswer);
      utils.click(telephony.forwardExternalCalls);

      utils.expectIsDisplayed(telephony.forwardExternalBusyNoAnswer);
      telephony.selectOption(telephony.forwardExternalBusyNoAnswer, dropdownVariables.voicemail);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.clickLastBreadcrumb();
      utils.click(telephony.directoryNumbers.first());

      utils.expectInputValue(telephony.forwardExternalBusyNoAnswer, dropdownVariables.voicemail);
    });

    it('should save call forward none selection', function () {
      utils.click(telephony.forwardNoneRadio);
      utils.expectIsNotDisplayed(telephony.forwardAll);
      utils.expectIsNotDisplayed(telephony.forwardBusyNoAnswer);
      utils.expectIsNotDisplayed(telephony.forwardExternalCalls);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.clickLastBreadcrumb();
      utils.click(telephony.directoryNumbers.first());

      utils.expectIsDisplayed(telephony.internalNumber);
      utils.expectIsNotDisplayed(telephony.forwardAll);
      utils.expectIsNotDisplayed(telephony.forwardBusyNoAnswer);
      utils.expectIsNotDisplayed(telephony.forwardExternalCalls);
    });

    it('should change caller id to custom display', function () {
      utils.expectIsDisabled(telephony.callerId);

      utils.click(telephony.callerIdCustom);
      utils.waitUntilEnabled(telephony.callerId);
      utils.sendKeys(telephony.callerId, 'custom');
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.clickLastBreadcrumb();
      utils.click(telephony.directoryNumbers.first());

      utils.waitUntilEnabled(telephony.callerId);
      utils.expectAttribute(telephony.callerId, 'value', 'custom');
    });

    it('should change caller id to default display', function () {
      utils.click(telephony.callerIdDefault);
      utils.expectIsDisabled(telephony.callerId);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.clickLastBreadcrumb();
      utils.click(telephony.directoryNumbers.first());

      utils.expectIsDisabled(telephony.callerId);
    });

    it('should cancel a new directory number add', function () {
      utils.clickLastBreadcrumb();
      utils.expectIsDisplayed(telephony.communicationPanel);
      utils.click(telephony.communicationActionButton);
      utils.click(telephony.newLineButton);

      utils.expectIsDisplayed(telephony.lineConfigurationPanel);
      utils.click(telephony.cancelButton);
      utils.expectIsDisplayed(telephony.communicationPanel);
    });

    it('should add a new directory number', function () {
      utils.expectIsDisplayed(telephony.communicationPanel);
      utils.click(telephony.communicationActionButton);
      utils.click(telephony.newLineButton);

      utils.expectIsDisplayed(telephony.lineConfigurationPanel);
      telephony.waitForNewInternalNumber();
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');
    });

    it('should verify new number', function () {
      utils.clickLastBreadcrumb();
      utils.expectIsDisplayed(telephony.communicationPanel);
      utils.expectIsDisplayed(telephony.directoryNumbers.first());
      utils.expectCount(telephony.directoryNumbers, 2);

      utils.click(telephony.directoryNumbers.last());
      utils.expectIsDisplayed(telephony.lineConfigurationPanel);
    });

    it('should update directory number', function () {
      utils.click(telephony.internalNumber);
      utils.click(telephony.internalNumberOptionFirst);
      telephony.retrieveInternalNumber().then(function (number) {
        utils.click(telephony.saveButton);
        notifications.assertSuccess('Line configuration saved successfully');

        utils.clickLastBreadcrumb();
        utils.expectIsDisplayed(telephony.directoryNumbers.last());
        utils.expectText(telephony.directoryNumbers.last(), number);

        utils.click(telephony.directoryNumbers.last());
        utils.expectIsDisplayed(telephony.lineConfigurationPanel);
      });
    });

    it('should save adding an external number', function () {
      telephony.retrieveExternalNumber().then(function (originalNumber) {
        utils.click(telephony.externalNumber);
        utils.click(telephony.externalNumberOptionLast);
        telephony.retrieveExternalNumber().then(function (number) {
          if (number !== originalNumber) {
            utils.click(telephony.saveButton);
            notifications.assertSuccess('Line configuration saved successfully');

            utils.clickLastBreadcrumb();
            utils.expectIsDisplayed(telephony.directoryNumbers.last());
            utils.expectText(telephony.directoryNumbers.last(), number);

            utils.click(telephony.directoryNumbers.last());
            utils.expectIsDisplayed(telephony.lineConfigurationPanel);
          }
        });
      });
    });

    it('should delete the non-primary number', function () {
      utils.click(telephony.lineConfigurationActionButton);
      utils.click(telephony.removeButton);
      utils.click(telephony.disassociateLine);
      notifications.assertSuccess('Line successfully unassigned from user');

      utils.expectIsDisplayed(telephony.communicationPanel);
      utils.expectCount(telephony.directoryNumbers, 1);
    });
  });

  it('should delete added user', function () {
    deleteUtils.deleteSquaredUCUser(currentUser.meta.organizationID, currentUser.id, token);
    deleteUtils.deleteUser(user);
  });

  it('should log out', function () {
    navigation.logout();
  });
});