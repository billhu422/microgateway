var loopback = require('loopback');
var boot = require('loopback-boot');
var async = require('async');
var environment = require('../../utils/environment');
var DATASTORE_PORT = environment.DATASTORE_PORT;

var app = module.exports = loopback();

app.start = function() {
  async.series([
  function(callback) {
    environment.getVariable(
      DATASTORE_PORT,
      function(value) {
        if (value) {
          app.set('port', value);
        }
      },
      callback
    );
  },
  function(callback) {
    // start the web server
    return app.listen(function() {
      app.emit('started');
      var baseUrl = app.get('url').replace(/\/$/, '');
      var port = app.get('port');
      process.env['DATASTORE_PORT'] = port;
      console.log('Web server listening at: %s port: %s', baseUrl, port);
      if (app.get('loopback-component-explorer')) {
        var explorerPath = app.get('loopback-component-explorer').mountPath;
        console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
      }
    });
  }]);
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});