var testsContext;

// Bootstrap the app
require('./app/bootstrap');
require('angular-mocks');

// Load the rest of the app
require('./app/scripts/main');

// Test Dependencies
require('jasmine-jquery/lib/jasmine-jquery.js');
require('sinon');
require('karma-sinon');
require('jasmine-sinon');
require('jasmine-promise-matchers/dist/jasmine-promise-matchers.js');
require('bardjs/dist/bard.js');

// Initial test setup
require('./test/global.spec.js');

// Require all specs
requireAll(require.context('./app', true, /\.spec\.(js|ts)$/));

function requireAll(requireContext) {
  return requireContext.keys().forEach(requireContext);
}
