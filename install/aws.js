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
      zones.HostedZones.forEach((z) => domains.push(z.Name));
      Marker = zones.NextMarker;
    } while (zones.IsTruncated);
    return domains;
  } catch (e) {
    const logger = createLogger();
    logger.error('Error fetching Route53 Hosted Zones', e.message);
    throw e;
  }
};
