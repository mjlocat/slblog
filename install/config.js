const fs = require('fs');
const createLogger = require('./logger');

const configFileName = 'config.json';

module.exports.getConfig = () => {
  const logger = createLogger();
  let config = {};
  let configStr;

  if (!fs.existsSync(configFileName)) {
    logger.warn('Config file does not exist, starting with blank configuration');
    return config;
  }

  try {
    configStr = fs.readFileSync(configFileName);
  } catch (e) {
    logger.error('Unable to read config file', e.message);
    throw e;
  }

  try {
    config = JSON.parse(configStr);
  } catch (e) {
    logger.error('Unable to parse config file', e.message);
    throw e;
  }

  return config;
};

module.exports.saveConfig = (config) => {
  try {
    fs.writeFileSync(configFileName, JSON.stringify(config, null, 2));
  } catch (e) {
    const logger = createLogger();
    logger.error('Unable to write config file', e.message);
    throw e;
  }
};
