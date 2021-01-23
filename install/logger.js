const { createLogger, format, transports } = require('winston');

module.exports = () => {
  const logger = createLogger();
  logger.add(new transports.Console({
    format: format.simple()
  }));
  return logger;
};
