const aws = require('aws-sdk');
const createLogger = require('./logger');

module.exports.getHostedZones = async () => {
  try {
    const route53 = new aws.Route53();
    const domains = [];
    let Marker = null;
    let zones = {};
    do {
      // eslint-disable-next-line no-await-in-loop
      zones = await route53.listHostedZones({ Marker }).promise();
      zones.HostedZones.forEach((z) => domains.push({ id: z.Id, name: z.Name }));
      Marker = zones.NextMarker;
    } while (zones.IsTruncated);
    return domains;
  } catch (e) {
    const logger = createLogger();
    logger.error('Error fetching Route53 Hosted Zones', e.message);
    throw e;
  }
};

module.exports.getDomainRecordSets = async (zoneId) => {
  try {
    const route53 = new aws.Route53();
    const records = [];
    let StartRecordIdentifier = null;
    let result = {};
    do {
      // eslint-disable-next-line no-await-in-loop
      result = await route53.listResourceRecordSets({
        HostedZoneId: zoneId,
        StartRecordIdentifier
      }).promise();
      const filteredRecords = result.ResourceRecordSets.filter((rs) => ['A', 'AAAA', 'CNAME'].indexOf(rs.Type) !== -1);
      filteredRecords.forEach((fr) => {
        if (!records.find((r) => r === fr.Name)) {
          records.push(fr.Name);
        }
      });
      StartRecordIdentifier = result.NextRecordIdentifier;
    } while (result.IsTruncated);
    return records;
  } catch (e) {
    const logger = createLogger();
    logger.error('Error fetching Route53 Record Sets', e.message);
    throw e;
  }
};
