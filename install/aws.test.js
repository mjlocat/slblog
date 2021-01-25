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
  const expectedResult = [
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
  ];
  const result = await aws.getHostedZones();
  expect(result).toEqual(expectedResult);
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

test('List zone record sets', async () => {
  awsMock.mock('Route53', 'listResourceRecordSets', (params, callback) => {
    if (!params.StartRecordIdentifier) {
      callback(null, {
        ResourceRecordSets: [
          {
            Type: 'NS',
            Name: 'foo.com.'
          }, {
            Type: 'A',
            Name: 'foo.com.'
          }, {
            Type: 'AAAA',
            Name: 'foo.com.'
          }, {
            Type: 'PTR',
            Name: '1.0.0.127'
          }
        ],
        IsTruncated: true,
        NextRecordIdentifier: 'foo'
      });
    } else if (params.StartRecordIdentifier === 'foo') {
      callback(null, {
        ResourceRecordSets: [
          {
            Type: 'CNAME',
            Name: 'www.foo.com.'
          }, {
            Type: 'AAAA',
            Name: 'api.foo.com.'
          }, {
            Type: 'PTR',
            Name: 'ptr.foo.com.'
          }
        ]
      });
    } else {
      callback('foo');
    }
  });
  const expected = ['foo.com.', 'www.foo.com.', 'api.foo.com.'];

  const result = await aws.getDomainRecordSets('foo');
  expect(result).toEqual(expected);
  awsMock.restore('Route53', 'listResourceRecordSets');
});

test('List zone record sets fails', async () => {
  awsMock.mock('Route53', 'listResourceRecordSets', (params, callback) => {
    callback('foo');
  });
  const testException = async () => {
    let exceptionThrown = false;
    try {
      await aws.getDomainRecordSets('foo');
    } catch (e) {
      exceptionThrown = true;
    }
    return exceptionThrown;
  };
  expect(testException()).toBeTruthy();
  awsMock.restore('Route53', 'listResourceRecordSets');
});
