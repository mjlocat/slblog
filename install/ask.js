const prompt = require('prompt-async');
const createLogger = require('./logger');

const logger = createLogger();
prompt.message = '';
prompt.delimiter = '';

module.exports = async (properties) => {
  try {
    prompt.start();
    const result = await prompt.get(properties);
    return result[properties.name];
  } catch (e) {
    logger.error('Error getting user input');
    throw e;
  }
};
