// Load the AWS SDK for Node.js
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const logger = require('../../utilities/logger.js');
const log = logger.logger;

// sever.js will use s3 if not in local environment. Assuming s3 is set up on cloud.gov and VCAP_SERVICES is set.
log.info('Using VCAP_SERVICES Information to work with s3.');
const s3_vcap_services = JSON.parse(process.env.VCAP_SERVICES);
const s3_access_key_id = s3_vcap_services['s3'][0].credentials.access_key_id;
const s3_bucket = s3_vcap_services['s3'][0].credentials.bucket;
const s3_region = s3_vcap_services['s3'][0].credentials.region;
const s3_secret_access_key = s3_vcap_services['s3'][0].credentials.secret_access_key;

const s3Client = new S3Client({
  credentials: {
    accessKeyId: s3_access_key_id,
    secretAccessKey: s3_secret_access_key,
  },
  region: s3_region,
});

const retrieveFileFromS3 = async (filename) => {
  const command = new GetObjectCommand({
    Bucket: s3_bucket,
    Key: filename,
  });

  try {
    const response = await s3Client.send(command);
    if (!response || !response.Body) {
      logger.error('S3 file response body is empty');
    }
    return await response?.Body?.transformToString('base64');
  } catch (error) {
    logger.error(`S3 error retrieving file: ${error}`);
    throw error;
  }
};

const uploadFileToS3 = async (filename, content, contentType) => {
  const command = new PutObjectCommand({
    Bucket: s3_bucket,
    Key: filename,
    Body: content,
    ContentType: contentType,
  });

  try {
    const response = await s3Client.send(command);
    if (!response) {
      logger.error('S3 file upload response is empty');
    }
    return response;
  } catch (error) {
    logger.error(`S3 error uploading file: ${error}`);
    throw error;
  }
};

module.exports = {
  retrieveFileFromS3,
  uploadFileToS3,
};
