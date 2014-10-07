'use strict';

/* global describe */
/* global it */
/* global by */
/* global browser */
/* global expect */
/* global element */

//var config = require('./testconfig.js');

// encrypted param from invitation email link for "Test User <phtest77+int1@gmail.com>"
//var encryptedQueryParam = 'bnlA6k3ZerWIccYYY2RndVEeMjFu914UOsnFVyYNQoMrkJ7Hye+VFJ20BW2ghuv/7auSaumsYWmMkAlT+HIMqMKyK7AmUY3QhKY8fFXx34AQbKMkqy1ogx8uJUp1QL0E';
var encryptedQueryParam = 'bnlA6k3ZerWIccYYY2RndVEeMjFu914UOsnFVyYNQoOtS2WBXdmPiQau5G/ErBDSiG5JxjtV9Dk6HIGGAAAkBQmkfHv5S9E8Ub+8rIeosI0QXZbR+/9ZN0m7BEtQIvRLfDFBFqh+L0B7vKsyzLGY/hy+SZ6sLAV22vzHZzWsIMg6OIP5gV/zkw8MLEFAyPNQHHkQQ5t7WB5QhUExd05+XQ==';
// Notes:
// - State is conserved between each describe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

describe('invite page with user param', function() {

  it('should forward to squared app without page param', function() {
    browser.get('#/invite');

    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.id('btn-login'));
    }).then(function() {
      expect(browser.driver.getCurrentUrl()).toContain('web.wbx2.com');
    });
  });

  it('should forward to squared app with page param', function() {
    browser.get('#/invite?user=' + encryptedQueryParam);

    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.id('btn-login'));
    }).then(function() {
      expect(browser.driver.getCurrentUrl()).toContain('web.wbx2.com');
    });
  });

});

describe('Invite Launcher Flow', function()  {

  it('invitelauncher should forward to squared app', function() {
    browser.get('#/invitelauncher');
    expect(invite.inviteLauncher.isDisplayed()).toBeTruthy();
  });

});

describe('App Launcher Flow', function() {

  it('applauncher should forward to squared app', function() {
    browser.get('#/applauncher');

    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.id('btn-login'));
    }).then(function() {
      expect(browser.driver.getCurrentUrl()).toContain('web.wbx2.com');
    });

  });


  it('applauncher should forward to squared app', function() {
    browser.get('/applauncher.html');

    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.id('btn-login'));
    }).then(function() {
      expect(browser.driver.getCurrentUrl()).toContain('web.wbx2.com');
    });

  });

});
