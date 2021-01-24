/* global test */
/* global expect */
const validators = require('./validators');

test('Good prefix', () => {
  expect(validators.prefixValidator('This1Is-Valid2-')).toBe(true);
});

test('Bad prefix', () => {
  ['1foo-', 'foo-bar', 'foo$-'].forEach((str) => {
    expect(validators.prefixValidator(str)).not.toBe(true);
  });
});
