const validators = require('./validators');

test('Good prefix', () => {
  expect(validators.prefixValidator('This1Is-Valid2-')).toBe(true);
});

test('Bad prefix', () => {
  ['1foo-', 'foo-bar', 'foo$-'].forEach((str) => {
    expect(validators.prefixValidator(str)).not.toBe(true);
  });
});

test('Good hostname', () => {
  expect(validators.hostnameValidator('N3w-H0st')).toBe(true);
});

test('Bad hostname', () => {
  ['', 'blog.example.com', 'my$host', 'b@b'].forEach((str) => {
    expect(validators.hostnameValidator(str)).not.toBe(true);
  });
});