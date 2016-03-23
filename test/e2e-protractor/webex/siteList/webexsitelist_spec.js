'use strict';

describe('Services > Webex page aka Site List page', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = false;
  });

  afterEach(function () {
    browser.ignoreSynchronization = true;
    utils.dumpConsoleErrors();
  });

  describe(': CSV Export/Import : ', function () {
    it('should allow login as admin user ' + sitelist.t31CSVToggleUser.testAdminUsername, function () {
      login.loginThroughGui(sitelist.t31CSVToggleUser.testAdminUsername, sitelist.t31CSVToggleUser.testAdminPassword);
    });

    it('should navigate to webex site list', function () {
      navigation.clickServicesTab();
      utils.click(sitelist.conferencingLink);
      utils.wait(sitelist.siteListPageId);
    });

    it('should detect the CSV column', function () {
      utils.wait(sitelist.csvColumnId);
    });

    it('should detect CSV Export & Import status is given', function () {
      utils.wait(sitelist.csvImportId);
      utils.wait(sitelist.csvExportId);
    });

    it('should log out', function () {
      navigation.logout();
    });
  });

  //Start T30 CSV Not Available User Test 
  describe('T30 CSV Not Available Test : ', function () {

    it('should login as admin user ' + sitelist.t30csvNotAvailableUser.testAdminUsername + ', and navigate to site list page', function () {
      login.loginThroughGui(sitelist.t30csvNotAvailableUser.testAdminUsername, sitelist.t30csvNotAvailableUser.testAdminPassword);
      navigation.clickServicesTab();
      utils.click(sitelist.conferencingLink);
    });

    it('should detect Not Available', function () {
      utils.wait(sitelist.t30csvNotAvail);
    });

    it('should log out', function () {
      navigation.logout();
    });
  });

  //Start multi center license tests
  xdescribe(': License Types - Single : ', function () {

    it('should allow login as admin user ' + sitelist.multiCenterLicenseUser_single.testAdminUsername, function () {
      login.loginThroughGui(sitelist.multiCenterLicenseUser_single.testAdminUsername, sitelist.multiCenterLicenseUser_single.testAdminPassword);
    });

    it('should navigate to webex site list page', function () {
      navigation.clickServicesTab();
      utils.click(sitelist.conferencingLink);
      utils.wait(sitelist.siteListPageId);
    });

    it('should detect the license types column', function () {
      utils.wait(sitelist.licenseTypesColumnId);
    });

    it('should detect text MC 100', function () {
      var mc100 = "Meeting Center 100";
      utils.expectText(sitelist.singleLicenseSiteId, mc100);
    });

    it('should log out', function () {
      navigation.logout();
    });
  });

  xdescribe(': License Types - Multiple : ', function () {

    it('should allow login as admin user ' + sitelist.multiCenterLicenseUser_multiple.testAdminUsername, function () {
      login.loginThroughGui(sitelist.multiCenterLicenseUser_multiple.testAdminUsername, sitelist.multiCenterLicenseUser_multiple.testAdminPassword);
    });

    it('should navigate to webex site list page', function () {
      navigation.clickServicesTab();
      utils.click(sitelist.conferencingLink);
      utils.wait(sitelist.siteListPageId);
    });

    it('should detect the license types column', function () {
      utils.wait(sitelist.licenseTypesColumnId);
    });

    it('should detect text multiple', function () {
      var multiple = "Multiple...";
      utils.expectText(sitelist.multiLicenseSiteId, multiple);
    });

    it('should log out', function () {
      navigation.logout();
    });
  });
});
