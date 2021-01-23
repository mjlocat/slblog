/* global jest */
/* global test */
/* global expect */
const config = require('./config');
const install = require('./install');

jest.mock('./config');

test('Installer script initializes configuration and saves at the end', () => {
  const configObj = { foo: 'bar' };
  config.getConfig.mockReturnValueOnce(configObj);
  install.runInstaller();
  expect(config.getConfig).toHaveBeenCalled();
  expect(config.saveConfig).toHaveBeenCalledWith(configObj);
});
