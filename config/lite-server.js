var compression = require('compression')();
var customCSPmiddleware = require('../utils/customCSPmiddleware');
var args = require('yargs').argv;
var host = args.host || '127.0.0.1';
var port = args.port || '8000';

module.exports = {
  port: port,
  host: host,
  files: ['./app/**/*.{html,js,ts,json,csv,pdf}'],
  server: {
    middleware: [
      compression,
      customCSPmiddleware,
    ]
  },
  ghostMode: {
    clicks: false,
    forms: false,
    scroll: false,
  },
  open: args.noopen ? false : 'external',
};
