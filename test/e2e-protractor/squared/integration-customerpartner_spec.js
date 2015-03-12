'use strict';

/* global describe */
/* global it */
/* global browser */
/* global expect */

describe('CS Admin flow', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  it('should just login', function () {
    login.login('customer-support-admin');
  });

  // Navigation bar
  describe('Navigation Bar', function () {

    it('should display correct tabs for user based on role', function () {
      utils.expectIsDisplayed(navigation.homeTab);
      utils.expectIsDisplayed(navigation.customersTab);
      utils.expectIsDisplayed(navigation.usersTab);
      utils.expectIsDisplayed(navigation.reportsTab);
      utils.expectIsDisplayed(navigation.supportTab);
      expect(navigation.getTabCount()).toBe(6);
    });

    it('clicking on customers tab should change the view', function () {
      navigation.clickCustomers();
      utils.expectIsDisplayed(partner.customerList);
      utils.expectIsNotDisplayed(partner.addButton);
      utils.expectIsDisplayed(partner.adminCustomerOrgId);
      utils.expectIsDisplayed(partner.regularCustomerOrgId);
    });

    it('clicking on customers should enable/disable ability to launch appropriately', function () {
      utils.click(partner.adminCustomerOrgId);
      utils.expectIsDisplayed(partner.launchCustomerPanelButton);
      expect(partner.launchCustomerPanelButton.isEnabled()).toBeTruthy();
      utils.click(partner.regularCustomerOrgId);
      utils.expectIsDisplayed(partner.launchCustomerPanelButton);
      expect(partner.launchCustomerPanelButton.isEnabled()).toBeFalsy();
    });

  });

  // Log Out
  describe('Log Out', function () {
    it('should log out', function () {
      navigation.logout();
    });
  });

});

describe('CS User flow', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  it('should just login', function () {
    login.login('customer-support-user');
  });

  // Navigation bar
  describe('Navigation Bar', function () {

    it('should display correct tabs for user based on role', function () {
      utils.expectIsDisplayed(navigation.homeTab);
      utils.expectIsDisplayed(navigation.customersTab);
      utils.expectIsDisplayed(navigation.reportsTab);
      utils.expectIsDisplayed(navigation.supportTab);
      expect(navigation.getTabCount()).toBe(4);
    });

    it('clicking on customers tab should change the view', function () {
      navigation.clickCustomers();
      utils.expectIsDisplayed(partner.customerList);
      utils.expectIsNotDisplayed(partner.addButton);
      utils.expectIsDisplayed(partner.adminCustomerOrgId);
      utils.expectIsDisplayed(partner.regularCustomerOrgId);
    });

    it('clicking on customers should enable/disable ability to launch appropriately', function () {
      utils.click(partner.regularCustomerOrgId);
      utils.expectIsDisplayed(partner.launchCustomerPanelButton);
      expect(partner.launchCustomerPanelButton.isEnabled()).toBeTruthy();
      utils.click(partner.adminCustomerOrgId);
      utils.expectIsDisplayed(partner.launchCustomerPanelButton);
      expect(partner.launchCustomerPanelButton.isEnabled()).toBeFalsy();
    });

  });

  // Log Out
  describe('Log Out', function () {
    it('should log out', function () {
      navigation.logout();
    });
  });

});