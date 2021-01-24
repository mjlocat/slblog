/* global jest */
/* global test */
/* global expect */
const config = require('./config');
const ask = require('./ask');
const install = require('./install');

jest.mock('./config');
jest.mock('./ask');
ask.mockReturnValue('bar');

test('Installer script initializes configuration and saves at the end', async () => {
  const configObj = { foo: 'bar' };
  config.getConfig.mockReturnValueOnce(configObj);
  await install.runInstaller();
  expect(config.getConfig).toHaveBeenCalled();
  expect(config.saveConfig).toHaveBeenCalled();
});

test('Interrupt handler function saves config', () => {
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
  install.interruptHandler();
  expect(config.saveConfig).toHaveBeenCalled();
  expect(mockExit).toHaveBeenCalledWith(1);
});
