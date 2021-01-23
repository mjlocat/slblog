/* global jest */
/* global test */
/* global expect */

const prompt = require('prompt-async');
const ask = require('./ask');

jest.mock('prompt-async');

test('Ask calls prompt-async', async () => {
  prompt.get.mockResolvedValueOnce({ foo: 'bar' });
  const result = await ask({ name: 'foo' });
  expect(result).toBe('bar');
});

test('Prompt errors are handled', () => {
  prompt.get.mockRejectedValueOnce('foo');

  const testException = async () => {
    let exceptionThrown = false;
    try {
      await ask({ name: 'foo' });
    } catch (e) {
      exceptionThrown = true;
    }
    return exceptionThrown;
  };

  expect(testException()).toBeTruthy();
});
