const { Route53Client } = require('@aws-sdk/client-route-53');
const { getHostedZones, getDomainRecordSets } = require('./aws');
const createLogger = require('./logger');

jest.mock('@aws-sdk/client-route-53');
jest.mock('./logger');

describe('getHostedZones', () => {
  let sendMock;
  let loggerMock;

  beforeEach(() => {
    sendMock = jest.fn();
    Route53Client.mockImplementation(() => ({
      send: sendMock,
    }));
    loggerMock = {
      error: jest.fn(),
    };
    createLogger.mockReturnValue(loggerMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return hosted zones', async () => {
    sendMock.mockResolvedValueOnce({
      HostedZones: [
        { Id: 'zone1', Name: 'example.com' },
        { Id: 'zone2', Name: 'example.org' },
      ],
      IsTruncated: false,
    });

    const result = await getHostedZones();

    expect(result).toEqual([
      { id: 'zone1', name: 'example.com' },
      { id: 'zone2', name: 'example.org' },
    ]);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it('should handle pagination', async () => {
    sendMock
      .mockResolvedValueOnce({
        HostedZones: [{ Id: 'zone1', Name: 'example.com' }],
        IsTruncated: true,
        NextMarker: 'marker1',
      })
      .mockResolvedValueOnce({
        HostedZones: [{ Id: 'zone2', Name: 'example.org' }],
        IsTruncated: false,
      });

    const result = await getHostedZones();

    expect(result).toEqual([
      { id: 'zone1', name: 'example.com' },
      { id: 'zone2', name: 'example.org' },
    ]);
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it('should log and throw an error if fetching hosted zones fails', async () => {
    const errorMessage = 'Error fetching Route53 Hosted Zones';
    sendMock.mockRejectedValueOnce(new Error(errorMessage));

    await expect(getHostedZones()).rejects.toThrow(errorMessage);
    expect(loggerMock.error).toHaveBeenCalledWith('Error fetching Route53 Hosted Zones', errorMessage);
  });
});

describe('getDomainRecordSets', () => {
  let sendMock;
  let loggerMock;

  beforeEach(() => {
    sendMock = jest.fn();
    Route53Client.mockImplementation(() => ({
      send: sendMock,
    }));
    loggerMock = {
      error: jest.fn(),
    };
    createLogger.mockReturnValue(loggerMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return domain record sets', async () => {
    sendMock.mockResolvedValueOnce({
      ResourceRecordSets: [
        { Name: 'example.com', Type: 'A' },
        { Name: 'example.com', Type: 'AAAA' },
        { Name: 'example.org', Type: 'CNAME' },
        { Name: 'example.net', Type: 'AAAA' },
        { Name: 'example.info', Type: 'TXT' },
      ],
      IsTruncated: false,
    });

    const result = await getDomainRecordSets('zoneId');

    expect(result).toEqual(['example.com', 'example.org', 'example.net']);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it('should handle pagination', async () => {
    sendMock
      .mockResolvedValueOnce({
        ResourceRecordSets: [{ Name: 'example.com', Type: 'A' }],
        IsTruncated: true,
        NextRecordIdentifier: 'identifier1',
      })
      .mockResolvedValueOnce({
        ResourceRecordSets: [{ Name: 'example.org', Type: 'CNAME' }],
        IsTruncated: false,
      });

    const result = await getDomainRecordSets('zoneId');

    expect(result).toEqual(['example.com', 'example.org']);
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it('should log and throw an error if fetching domain record sets fails', async () => {
    const errorMessage = 'Error fetching Route53 Record Sets';
    sendMock.mockRejectedValueOnce(new Error(errorMessage));

    await expect(getDomainRecordSets('zoneId')).rejects.toThrow(errorMessage);
    expect(loggerMock.error).toHaveBeenCalledWith('Error fetching Route53 Record Sets', errorMessage);
  });
});
