const config = require('./config');

let configObj = {};

module.exports.runInstaller = async () => {
  configObj = config.getConfig();

  config.saveConfig(configObj);
};

/* istanbul ignore next */
if (require.main === module) {
  module.exports.runInstaller();
}
