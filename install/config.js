const fs = require('fs');
const { createLogger, format, transports } = require('winston');

const configFileName = 'config.json';
const logger = createLogger();
logger.add(new transports.Console({
  format: format.simple()
}));

module.exports.getConfig = () => {
  let config = {};
  if (!fs.existsSync(configFileName)) {
    logger.warn('Config file does not exist, starting with blank configuration');
    return config;
  }
  try {
    const configStr = fs.readFileSync(configFileName);
    try {
      config = JSON.parse(configStr);
    } catch (e) {
      logger.error('Unable to parse config file', e.message);
    }
  } catch (e) {
    logger.error('Unable to read config file', e.message);
  }
  return config;
};

module.exports.saveConfig = (config) => {
  try {
    fs.writeFileSync(configFileName, JSON.stringify(config, null, 2));
  } catch (e) {
    logger.error('Unable to write config file', e.message);
  }
};
