const prompts = require('prompts');
const aws = require('./aws');
const config = require('./config');
const validators = require('./validators');

let configObj = {};

module.exports.getZoneOptions = async (zone) => {
  const zones = await aws.getHostedZones();
  const choices = zones.map((z) => ({
    title: z.name.replace(/\.$/, ''),
    value: {
      id: z.id,
      name: z.name.replace(/\.$/, '')
    }
  }));
  const initial = zones.findIndex((z) => z.name.replace(/\.$/, '') === zone);
  return { choices, initial: initial === -1 ? undefined : initial };
};

module.exports.getHostnameOptions = async (hostedZoneId, defaultHostname) => {
  const hostnames = await aws.getDomainRecordSets(hostedZoneId);
  const choices = hostnames.map((h) => ({
    title: h.replace(/\.$/, ''),
    value: h.replace(/\.$/, '')
  }));
  const initial = hostnames.findIndex((h) => h.replace(/\.$/, '') === defaultHostname);
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

  const zoneOptions = await module.exports.getZoneOptions(
    configObj.zone ? configObj.zone.name : undefined
  );
  if (zoneOptions.choices.length) {
    Object.assign(configObj, await prompts({
      type: 'select',
      name: 'zone',
      message: 'The following hosted zones were found, select one to use for your blog or select "other"',
      choices: zoneOptions.choices,
      initial: zoneOptions.initial
    }));
  }

  // If selecting "other" zone, insert logic here

  if (configObj.zone) {
    const hostnameOptions = await module.exports.getHostnameOptions(configObj.zone.id, configObj.hostname);
    if (hostnameOptions.choices.length) {
      Object.assign(configObj, await prompts({
        type: 'select',
        name: 'hostname',
        message: 'The following hostnames were found, select one to use or select "other"',
        choices: [{ title: 'other', value: 'other' }, ...hostnameOptions.choices],
        initial: hostnameOptions.initial
      }));
    }
  }

  // If selecting "other" hostname, insert logic here
  if (configObj.hostname === 'other') {
    Object.assign(configObj, await prompts({
      type: 'text',
      name: 'hostname',
      message: 'Enter the hostname to use for your blog',
      validate: validators.hostnameValidator
    }));
    configObj.hostname = `${configObj.hostname}.${configObj.zone.name}`;
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
