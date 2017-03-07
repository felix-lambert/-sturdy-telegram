const bunyan     = require('bunyan');
const loadConfig = require('./configLoader');


module.exports = function() {
  loadConfig().then(function(config) {
    const loggerConfig = config.loggerConfig ?
      config.loggerConfig : {"name": "ct-app"};

    const log = bunyan.createLogger(loggerConfig);
    return log;
  }).catch(function(error) {
    /*I have to put console.log here because the bunyan logger
     * is being set in loadConfig
     */
    console.log(`loadConfig error: ${error}`);
  });
};
