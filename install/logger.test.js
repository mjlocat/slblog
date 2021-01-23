/* global test */
/* global expect */

const createLogger = require('./logger');

test('Logger gets created', () => {
  const logger = createLogger();
  expect(typeof logger).toBe('object');
});
