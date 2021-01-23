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

test('Config file exists, can\'t be read', () => {
  mockfs({
    'config.json': mockfs.file({
      content: '{}',
      mode: 0,
      uid: 0,
      gid: 0
    })
  });
  expect(config.getConfig).toThrow();
  mockfs.restore();
});

test('Config file has invalid json', () => {
  mockfs({
    'config.json': 'foo'
  });
  expect(config.getConfig).toThrow(SyntaxError);
  mockfs.restore();
});

test('Save config success', () => {
  mockfs({ });
  const configObj = { foo: 'bar' };
  config.saveConfig(configObj);
  expect(config.getConfig()).toEqual(configObj);
  mockfs.restore();
});

test('Save config overwrites existing', () => {
  mockfs({
    'config.json': 'foo'
  });
  const configObj = { foo: 'bar' };
  config.saveConfig(configObj);
  expect(config.getConfig()).toEqual(configObj);
  mockfs.restore();
});

test('Unable to save config', () => {
  mockfs({
    'config.json': mockfs.file({
      content: '{}',
      mode: 0,
      uid: 0,
      gid: 0
    })
  });
  expect(
    () => { config.saveConfig({ foo: 'bar' }); }
  ).toThrow();
  mockfs.restore();
});
