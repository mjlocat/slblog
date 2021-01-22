/* global test */
/* global expect */
const mockfs = require('mock-fs');
const config = require('./config');

test('Config file does not exist', () => {
  mockfs({});
  const configObj = config.getConfig();
  expect(configObj).toEqual({});
  mockfs.restore();
});

test('Config file is good', () => {
  const expectedObj = { foo: 'bar' };
  mockfs({
    'config.json': JSON.stringify(expectedObj)
  });
  const configObj = config.getConfig();
  expect(configObj).toEqual(expectedObj);
  mockfs.restore();
});
