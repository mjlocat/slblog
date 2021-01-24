/* global jest */
/* global test */
/* global expect */
const prompts = require('prompts');
const aws = require('./aws');
const config = require('./config');
const install = require('./install');

jest.mock('./aws');
jest.mock('./config');
jest.mock('prompts');

test('Installer script initializes configuration and saves at the end', async () => {
  const expectedConfig = {
    prefix: 'foo-',
    zone: 'foo.com.'
  };
  config.getConfig.mockReturnValueOnce({ });
  aws.getHostedZones.mockResolvedValueOnce(['foo.com.', 'bar.com.', 'baz.com.']);
  let savedConfig = {};
  config.saveConfig.mockImplementation((inConfig) => { savedConfig = inConfig; });
  prompts.mockResolvedValueOnce({ prefix: 'foo-' });
  prompts.mockResolvedValueOnce({ zone: 'foo.com.' });

  await install.runInstaller();
  expect(config.getConfig).toHaveBeenCalled();
  expect(config.saveConfig).toHaveBeenCalled();
  expect(savedConfig).toEqual(expectedConfig);
});

test('Installer script with no hosted zones available', async () => {
  config.getConfig.mockReturnValueOnce({ });
  aws.getHostedZones.mockResolvedValueOnce([]);
  let foundZone = false;
  config.saveConfig.mockImplementation((inConfig) => { foundZone = inConfig.zone; });

  await install.runInstaller();
  expect(foundZone).toBeFalsy();
});

test('Interrupt handler function saves config', () => {
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
  install.interruptHandler();
  expect(config.saveConfig).toHaveBeenCalled();
  expect(mockExit).toHaveBeenCalledWith(1);
});

test('Build hosted zone options', async () => {
  aws.getHostedZones.mockResolvedValueOnce(['foo.com.', 'bar.com.', 'baz.com.']);
  const result = await install.getZoneOptions('bar.com.');
  expect(result).toEqual({
    choices: [
      {
        title: 'foo.com',
        value: 'foo.com.'
      }, {
        title: 'bar.com',
        value: 'bar.com.'
      }, {
        title: 'baz.com',
        value: 'baz.com.'
      }
    ],
    initial: 1
  });
});
