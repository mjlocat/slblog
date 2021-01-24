/* global jest */
/* global test */
/* global expect */
const awsMock = require('aws-sdk-mock');
const createLogger = require('./logger');
const aws = require('./aws');

jest.mock('./logger');
const mockLogger = jest.fn();
createLogger.mockReturnValue({
  info: mockLogger,
  warn: mockLogger,
  error: mockLogger
});

test('List hosted zones', async () => {
  awsMock.mock('Route53', 'listHostedZones', (params, callback) => {
    if (!params.Marker) {
      callback(null, {
        HostedZones: [
          {
            Id: 'foo',
            Name: 'foo.com.',
            CallerReference: 'foo'
          }, {
            Id: 'bar',
            Name: 'bar.com.',
            CallerReference: 'bar'
          }
        ],
        IsTruncated: true,
        NextMarker: 'foobar'
      });
    } else if (params.Marker === 'foobar') {
      callback(null, {
        HostedZones: [
          {
            Id: 'baz',
            Name: 'baz.com.',
            CallerReference: 'baz'
          }
        ]
      });
    } else {
      callback('foo');
    }
  });
  const result = await aws.getHostedZones();
  expect(result).toEqual(['foo.com.', 'bar.com.', 'baz.com.']);
  awsMock.restore('Route53', 'listHostedZones');
});

test('List hosted zones fails', async () => {
  awsMock.mock('Route53', 'listHostedZones', (params, callback) => {
    callback('foo');
  });
  const testException = async () => {
    let exceptionThrown = false;
    try {
      await aws.getHostedZones();
    } catch (e) {
      exceptionThrown = true;
    }
    return exceptionThrown;
  };
  expect(testException()).toBeTruthy();
  awsMock.restore('Route53', 'listHostedZones');
});
