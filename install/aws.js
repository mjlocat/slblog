const {
  Route53Client,
  ListHostedZonesCommand,
  ListResourceRecordSetsCommand
} = require('@aws-sdk/client-route-53');
const createLogger = require('./logger');

async function getHostedZones() {
  const route53 = new Route53Client();
  const hostedZones = [];
  let Marker = null;
  let isTruncated = true;
  const logger = createLogger();

  try {
    while (isTruncated) {
      const params = Marker ? { Marker } : {};
      const command = new ListHostedZonesCommand(params);
      const response = await route53.send(command);

      response.HostedZones.forEach((zone) => {
        hostedZones.push({ id: zone.Id, name: zone.Name });
      });

      Marker = response.NextMarker;
      isTruncated = response.IsTruncated;
    }
  } catch (error) {
    logger.error('Error fetching Route53 Hosted Zones', error.message);
    throw error;
  }

  return hostedZones;
}

async function getDomainRecordSets(zoneId) {
  const route53 = new Route53Client();
  const records = [];
  let StartRecordIdentifier = null;
  let isTruncated = true;
  const logger = createLogger();

  try {
    while (isTruncated) {
      const params = {
        HostedZoneId: zoneId,
        StartRecordIdentifier
      };
      const command = new ListResourceRecordSetsCommand(params);
      const result = await route53.send(command);

      const filteredRecords = result.ResourceRecordSets.filter((rs) => ['A', 'AAAA', 'CNAME'].indexOf(rs.Type) !== -1);
      filteredRecords.forEach((fr) => {
        if (!records.find((r) => r === fr.Name)) {
          records.push(fr.Name);
        }
      });

      StartRecordIdentifier = result.NextRecordIdentifier;
      isTruncated = result.IsTruncated;
    }
    return records;
  } catch (e) {
    logger.error('Error fetching Route53 Record Sets', e.message);
    throw e;
  }
}

module.exports = { getHostedZones, getDomainRecordSets };
