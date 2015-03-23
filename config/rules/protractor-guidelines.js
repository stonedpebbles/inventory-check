module.exports = function(context) {
  var allowedIdentifiers = [
  // Jasmine
  'describe', 'xdescribe', 'it', 'xit', 'beforeEach', 'afterEach', 'done',
  // utils
  'utils', 'deleteUtils', 'deleteTrialUtils',
  // page objects
  'notifications', 'login', 'navigation', 'users', 'reports', 'support', 'roles', 'partner', 'wizard', 'invite', 'activate',
  'callrouting', 'servicesetup'
  ];

  var allowedPageElementMethods = ['first', 'last', 'then'];

  var allowedBrowserMethods = ['get', 'getWindowHandle', 'getAllWindowHandles', 'switchTo', 'executeScript'];

  return {
    CallExpression: function(node) {

      // Allow specific identifying objects or functions
      if ((node.callee.type == 'Identifier' &&
            allowedIdentifiers.indexOf(node.callee.name) > -1) ||
          (node.callee.type == 'MemberExpression' &&
            node.callee.object.type == 'Identifier' &&
            allowedIdentifiers.indexOf(node.callee.object.name) > -1)) {

        return;
      }

      // Disallow element locators
      if ((node.callee.type == 'Identifier' &&
            node.callee.name == 'element') ||
          (node.callee.type == 'MemberExpression' &&
            node.callee.object.type == 'Identifier' &&
            node.callee.object.name == 'by')) {

        context.report(node, 'Should not use element locators directly in spec. Extract element locators to page objects (test/e2e-protractor/pages).');
        return;
      }

      // Disallow expects
      if (node.callee.type == 'Identifier' &&
          node.callee.name == 'expect') {

        context.report(node, 'Should not use expect directly in spec. Use expectations from utils (test/e2e-protractor/utils/test.utils.js).');
        return;
      }

      // Disallow browser
      if (node.callee.type == 'MemberExpression' &&
          node.callee.object.type == 'Identifier' &&
          node.callee.object.name == 'browser') {

        // Allow specific browser methods
        if (node.callee.property.type == 'Identifier' &&
            allowedBrowserMethods.indexOf(node.callee.property.name) > -1) {
          return;
        }

        context.report(node, 'Should not use browser (eg. browser.wait) directly in spec. Use utils function (eg. utils.wait).');
        return;
      }

      // Disallow page element functions
      if (node.callee.type == 'MemberExpression') {

        // Allow specific page element functions
        if (node.callee.property.type == 'Identifier' &&
            allowedPageElementMethods.indexOf(node.callee.property.name) > -1) {
          return;
        }

        // Allow advanced browser functions (for window switching)
        if ((node.callee.object.type == 'MemberExpression' &&
              node.callee.object.object.type == 'Identifier' &&
              node.callee.object.object.name == 'browser') ||
            (node.callee.object.type == 'CallExpression' &&
              node.callee.object.callee.type == 'MemberExpression' &&
              node.callee.object.callee.object.type == 'Identifier' &&
              node.callee.object.callee.object.name == 'browser')) {
          return;
        }

        context.report(node, 'Should not invoke functions directly on page elements. Extract complex functionality to page objects (test/e2e-protractor/pages).');
        return;
      }

      // Log unchecked nodes
      // console.log('SOURCE: ' + context.getSource(node));
      // console.dir(node);
    }
  };
};