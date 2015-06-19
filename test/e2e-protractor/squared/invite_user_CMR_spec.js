'use strict';

/* global describe */
/* global it */
/* global login,navigation,users,utils,notifications, protractor, deleteUtils */

describe('CMR shown under Enterprise Edition', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
    utils.dumpConsoleErrors();
  });

  describe('Display the invite page', function () {
    it('should login as multiple-subscription-user', function () {
      login.login('multiple-subscription-user');
    });

    it('clicking on users tab should change the view', function () {
      navigation.clickUsers();
    });

    it('click on invite user button should pop up the page', function () {
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
    });
  });

  describe('should show CMR under EE', function () {
    it('if there is EE should show CMR option', function () {
      utils.expectIsDisplayed(users.servicesPanelCommunicationsCheckbox);
      utils.click(users.servicesPanelCommunicationsCheckbox);
      // utils.expectIsDisplayed(users.getMyThing());
    });

    it('clicking on cancel button should close the modal', function () {
      utils.click(users.closeAddUsers);
      utils.expectIsNotDisplayed(users.manageDialog);
    });
    it('should log out', function () {
      navigation.logout();
    });
  });

});