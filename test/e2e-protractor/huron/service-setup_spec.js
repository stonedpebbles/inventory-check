'use strict';

describe('First Time Wizard - CiscoUC Service Setup', function () {
  var pattern = servicesetup.getPattern();

  beforeAll(function () {
    login.login('huron-e2e');
  }, 120000);

  it('clicking on gear icon should open first time wizard', function () {
    navigation.clickFirstTimeWizard();
    utils.expectIsDisplayed(wizard.wizard);
    utils.expectIsDisplayed(wizard.leftNav);
    utils.expectIsDisplayed(wizard.mainView);
  });

  it('should load views according to left navigation clicks', function () {
    wizard.clickServiceSetup();
    utils.click(wizard.nextBtn);
    utils.expectText(wizard.mainviewTitle, 'Unified Communications');
    utils.expectIsDisplayed(servicesetup.timeZone);
    utils.expectIsDisplayed(servicesetup.steeringDigit);
    utils.expectIsDisplayed(servicesetup.siteSteeringDigit);
    utils.expectIsDisplayed(servicesetup.siteCode);
    utils.expectIsDisplayed(servicesetup.globalMOH);
    utils.expectIsDisplayed(servicesetup.siteCode);
    utils.expectIsDisplayed(servicesetup.companyVoicemail);
    utils.expectIsDisplayed(servicesetup.numberRanges.first());
  });

  it('should add a number range', function () {
    utils.click(servicesetup.addNumberRange);
    utils.sendKeys(servicesetup.newBeginRange, pattern);
    utils.sendKeys(servicesetup.newEndRange, pattern);
    utils.click(wizard.finishBtn);
    notifications.assertSuccess('saved successfully');
  });

  it('should delete the number range', function () {
    wizard.clickServiceSetup();
    utils.click(wizard.nextBtn);
    servicesetup.deleteNumberRange(pattern);
    notifications.assertSuccess('Successfully deleted');
  });

});