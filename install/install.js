const prompts = require('prompts');
const aws = require('./aws');
const config = require('./config');
const validators = require('./validators');

let configObj = {};

module.exports.getZoneOptions = async (zone) => {
  const zones = await aws.getHostedZones();
  const choices = zones.map((z) => ({ title: z.replace(/\.$/, ''), value: z }));
  const initial = zones.indexOf(zone);
  return { choices, initial: initial === -1 ? undefined : initial };
};

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

  const zoneOptions = await module.exports.getZoneOptions(configObj.zone);
  if (zoneOptions.choices.length) {
    Object.assign(configObj, await prompts({
      type: 'select',
      name: 'zone',
      message: 'The following hosted zones were found, select one to use or select "other"',
      choices: zoneOptions.choices,
      initial: zoneOptions.initial
    }));
  }
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
