'use strict';

/* global describe, it, expect, login */

describe('WebEx Common Settings -> Mobile', function () {

  it('should allow login as admin user', function () {
    login.loginThroughGui(sitesettings.testAdmin.username, sitesettings.testAdmin.password);
  });

  it('click on services tab', function () {
    navigation.clickServicesTab();
  });

  it('click on conferencing option', function () {
    utils.click(sitesettings.conferencing);
  });

  it('click on configure site cog', function () {
    utils.click(sitesettings.configureSJSITE14);
  });

  it('wait for WebEx settings index page to appear', function () {
    utils.wait(sitesettings.webexSiteSettingsPanel);
  });

  it('click on common settings mobile link', function () {
    utils.click(sitesettings.configureCommonMobileLink);
  });

  it('wait for common settings mobile page to appear', function () {
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.webexCommonMobileId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
  });

  /**  
    it('should pause', function () {
      browser.pause()
    });
  **/

  it('should allow log out', function () {
    navigation.logout();
  });
});