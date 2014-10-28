'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!',
  orgname: 'SquaredAdminTool',
  searchStr: 'fake'
};

var inputEmail;

// Notes:
// - State is conserved between each despribe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

describe('List users flow', function() {
  beforeEach(function() {
    this.addMatchers({
      toBeLessThanOrEqualTo: function() {
        return {
          compare: function(actual, expected) {
            return {
              pass: actual < expected || actual === expected,
              message: 'Expected ' + actual + 'to be less than or equal to ' + expected
            };
          }
        };
      }
    });
    utils.scrollTop();
  });

  it('should login as non-sso admin user', function() {
    login.login(testuser.username, testuser.password);
  });

  // Asserting listing users.
  describe('Listing users on page load', function() {
    it('clicking on users tab should change the view', function() {
      navigation.clickUsers();
      navigation.expectCurrentUrl('/users');
    });

    xit('should show first page of users', function() {
      users.assertPage('1');
    });

    xit('should list 20 or less users', function() {
      users.assertResultsLength(20);
    });
  });

  // Asserting pagination of users.
  xdescribe('Paginating users returned', function() {
    it('should paginate the total number of users', function() {
      //pagination is only relevant if total matches exceeds 20
      //Initial page
      users.assertPage('1');
      users.assertResultsLength(20);
      //next page
      users.nextPage.click();
      users.assertPage('2');
      users.assertResultsLength(0);
      //previous page
      users.prevPage.click();
      users.assertPage('1');
      users.assertResultsLength(20);
      users.search();
    });
  });

  // Asserting sorting of users.
  xdescribe('Sorting users', function() {
    it('should sort users by name', function() {
      users.assertSorting('name-sort');
    });

    it('should sort users by username', function() {
      users.assertSorting('username-sort');
    });
  });

  // Asserting search users.
  describe('search users on page', function() {
    it('should show first page of users based on search string', function() {
      users.search(testuser.searchStr, '60');
    });
  });

  // Add User
  describe('Add User', function() {
    it('click on invite subtab should show manage users', function() {
      users.addUsers.click();
      expect(users.managePanel.isDisplayed()).toBeTruthy();
      expect(users.addUsersField.isDisplayed()).toBeTruthy();
      //This button is now covered by another <ins> element.
      //expect(element(by.id('btn_callInit')).isDisplayed()).toEqual(true);
      expect(users.addButton.isDisplayed()).toBeTruthy();
    });

    it('should add user successfully and increase user count', function() {
      inputEmail = utils.randomTestEmail();

      users.addUsersField.clear();
      users.addUsersField.sendKeys(inputEmail);
      users.addUsersField.sendKeys(protractor.Key.ENTER);
      users.messengerCheckBox.click();
      users.addButton.click();
      notifications.assertSuccess(inputEmail, 'added successfully');
      users.closeAddUsers.click();
      browser.sleep(3000);

      users.search(inputEmail);
      users.userListEnts.then(function(cell) {
        expect(cell[0].getText()).toContain(inputEmail);
        cell[0].click();
      });
      browser.sleep(3000);
      expect(users.previewPanel.isDisplayed()).toBeTruthy();
      expect(users.previewName.isDisplayed()).toBeTruthy();

      users.closePreview.click();
    });
  });

  /* UNCOMMENT WHEN BACKEND IS PUSHED TO PROD */
  //Update entitlements
  describe('Updating entitlements', function() {
    it('should display initial entitlements from newly added user', function() {
      users.search(inputEmail);
      users.userListEnts.then(function(cell) {
        expect(cell[0].getText()).toContain(inputEmail);
        cell[0].click();
      });
      browser.sleep(3000); //TODO fix this - animation should be resolved by angular
      expect(users.squaredPanel.isDisplayed()).toBeTruthy();
      users.squaredPanel.click();
      browser.sleep(3000); //TODO fix this - animation should be resolved by angular

      users.checkBoxEnts.then(function(items) {
        expect(items.length).toBe(9);
      });

      expect(utils.hasClass(users.messengerCheckBox.element(by.css('.checkboxValue')), 'checked')).toBe(true);
      expect(utils.hasClass(users.squaredCheckBox.element(by.css('.checkboxValue')), 'checked')).toBe(true);

      users.fusionCheckBox.click();
      users.saveButton.click();

      notifications.assertSuccess(inputEmail, 'updated successfully');

      users.closeDetails.click();
    });
  });

  describe('Exporting to CSV', function() {
    it('should display the CSV export button', function() {
      expect(users.exportButton.isDisplayed()).toBeTruthy();
    });
  });

  describe('Clean up added user', function() {
    it('should delete added user', function() {
      deleteUtils.deleteUser(inputEmail).then(function(message) {
        expect(message).toEqual(200);
      }, function(data) {
        expect(data.status).toEqual(200);
      });
    });
  });

  it('should log out', function() {
    navigation.logout();
  });

});
