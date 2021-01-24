const config = require('./config');
const ask = require('./ask');

let configObj = {};

module.exports.runInstaller = async () => {
  process.on('SIGINT', module.exports.interruptHandler);

  configObj = config.getConfig();
  configObj.prefix = await ask({
    name: 'prefix',
    description: 'Enter a prefix to be applied to all resources created',
    type: 'string',
    default: configObj.prefix || 'slblog-',
    pattern: /^[a-zA-Z][a-z-A-Z0-9-]*-/,
    message: 'Must contain only numbers and letters, start with a letter and end in a dash'
  });

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
