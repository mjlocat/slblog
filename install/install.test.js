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
    zone: {
      id: 'foo',
      name: 'foo.com.'
    },
    hostname: 'www.foo.com'
  };
  config.getConfig.mockReturnValueOnce({ });
  aws.getHostedZones.mockResolvedValueOnce([
    {
      id: 'foo',
      name: 'foo.com.'
    }, {
      id: 'bar',
      name: 'bar.com.'
    }, {
      id: 'baz',
      name: 'baz.com.'
    }
  ]);
  aws.getDomainRecordSets.mockResolvedValue(['www.foo.com.']);
  let savedConfig = {};
  config.saveConfig.mockImplementation((inConfig) => { savedConfig = inConfig; });
  prompts.mockResolvedValueOnce({ prefix: 'foo-' });
  prompts.mockResolvedValueOnce({ zone: { id: 'foo', name: 'foo.com.' } });
  prompts.mockResolvedValueOnce({ hostname: 'www.foo.com' });

  await install.runInstaller();
  expect(config.getConfig).toHaveBeenCalled();
  expect(config.saveConfig).toHaveBeenCalled();
  expect(savedConfig).toEqual(expectedConfig);
});

test('Installer script with saved hosted zone in config', async () => {
  config.getConfig.mockReturnValueOnce(({ prefix: 'foo-', zone: { id: 'foo', name: 'foo.com.' } }));
  aws.getHostedZones.mockResolvedValueOnce([{ id: 'foo', name: 'foo.com.' }]);
  await install.runInstaller();
});

test('Installer script with no hosted zones available', async () => {
  config.getConfig.mockReturnValueOnce({ });
  aws.getHostedZones.mockResolvedValueOnce([]);
  let foundZone = false;
  config.saveConfig.mockImplementation((inConfig) => { foundZone = inConfig.zone; });

  await install.runInstaller();
  expect(foundZone).toBeFalsy();
});

test('Installer script with no hostnames available', async () => {
  config.getConfig.mockReturnValueOnce({ });
  prompts.mockResolvedValueOnce({ prefix: 'foo-' });
  aws.getHostedZones.mockResolvedValueOnce(([{ id: 'foo', name: 'foo.com.' }]));
  prompts.mockResolvedValueOnce({ zone: { id: 'foo', name: 'foo.com.' } });
  aws.getDomainRecordSets.mockResolvedValue([]);
  let foundHostname = false;
  config.saveConfig.mockImplementation((inConfig) => { foundHostname = inConfig.hostname; });

  await install.runInstaller();
  expect(foundHostname).toBeFalsy();
});

test('Interrupt handler function saves config', () => {
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
  install.interruptHandler();
  expect(config.saveConfig).toHaveBeenCalled();
  expect(mockExit).toHaveBeenCalledWith(1);
});

test('Build hosted zone options', async () => {
  aws.getHostedZones.mockResolvedValueOnce([
    {
      id: 'foo',
      name: 'foo.com.'
    }, {
      id: 'bar',
      name: 'bar.com.'
    }, {
      id: 'baz',
      name: 'baz.com.'
    }
  ]);
  const result = await install.getZoneOptions('bar.com');
  expect(result).toEqual({
    choices: [
      {
        title: 'foo.com',
        value: { id: 'foo', name: 'foo.com' }
      }, {
        title: 'bar.com',
        value: { id: 'bar', name: 'bar.com' }
      }, {
        title: 'baz.com',
        value: { id: 'baz', name: 'baz.com' }
      }
    ],
    initial: 1
  });
});

test('Build hostname options', async () => {
  aws.getDomainRecordSets.mockResolvedValue(['foo.com.', 'www.foo.com.', 'api.foo.com.']);
  const result = await install.getHostnameOptions('foo', 'www.foo.com');
  expect(aws.getDomainRecordSets).toHaveBeenCalledWith('foo');
  expect(result).toEqual({
    choices: [
      {
        title: 'foo.com',
        value: 'foo.com'
      }, {
        title: 'www.foo.com',
        value: 'www.foo.com'
      }, {
        title: 'api.foo.com',
        value: 'api.foo.com'
      }
    ],
    initial: 1
  });
});
