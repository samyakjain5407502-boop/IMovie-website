let app;
try {
  app = require('../server/server');
} catch (e) {
  try {
    app = require('./server/server');
  } catch (err) {
    app = require('../../../server/server');
  }
}

module.exports = app;
