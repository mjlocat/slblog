const prompts = require('prompts');
const config = require('./config');
const validators = require('./validators');

let configObj = {};

module.exports.runInstaller = async () => {
  process.on('SIGINT', module.exports.interruptHandler);

  configObj = config.getConfig();
  Object.assign(configObj, await prompts({
    type: 'text',
    name: 'prefix',
    message: 'Enter a prefix to be applied to all resources created',
    initial: configObj.prefix || 'slblog-',
    validate: validators.prefixValidator
  }));

  config.saveConfig(configObj);
  process.removeListener('SIGINT', module.exports.interruptHandler);
};

module.exports.interruptHandler = () => {
  config.saveConfig(configObj);
  process.exit(1);
};

/* istanbul ignore next */
if (require.main === module) {
  module.exports.runInstaller();
}
