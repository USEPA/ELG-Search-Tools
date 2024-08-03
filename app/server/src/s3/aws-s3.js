// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');

const logger = require('../../utilities/logger.js');
const log = logger.logger;

let s3;

let s3_vcap_services;
let s3_access_key_id;
let s3_bucket;
let s3_region;
let s3_secret_access_key;

if (process.env.VCAP_SERVICES) {
  log.info('Using VCAP_SERVICES Information to work with s3.');
  s3_vcap_services = JSON.parse(process.env.VCAP_SERVICES);
  s3_access_key_id = s3_vcap_services['s3'][0].credentials.access_key_id;
  s3_bucket = s3_vcap_services['s3'][0].credentials.bucket;
  s3_region = s3_vcap_services['s3'][0].credentials.region;
  s3_secret_access_key = s3_vcap_services['s3'][0].credentials.secret_access_key;
} else {
  log.warn('VCAP_SERVICES Information not found. s3 connection will not be attempted.');
}

if (s3_access_key_id !== '') {
  let config = new AWS.Config({
    accessKeyId: s3_access_key_id,
    secretAccessKey: s3_secret_access_key,
    region: s3_region,
  });

  AWS.config.update(config);
  s3 = new AWS.S3({ apiVersion: '2006-03-01' });
}

module.exports = {
  s3_bucket,
  s3,
};
