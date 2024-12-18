// Load the AWS SDK for Node.js
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const logger = require('../../utilities/logger.js');
const log = logger.logger;

const getS3Config = () => {
  const isLocal = process.env.NODE_ENV.toLowerCase() === 'local';

  if (isLocal) {
    return {
      s3_access_key_id: null,
      s3_bucket: null,
      s3_region: null,
      s3_secret_access_key: null,
    };
  } else {
    const s3_vcap_services = JSON.parse(process.env.VCAP_SERVICES);
    return {
      s3_access_key_id: s3_vcap_services['s3'][0].credentials.access_key_id,
      s3_bucket: s3_vcap_services['s3'][0].credentials.bucket,
      s3_region: s3_vcap_services['s3'][0].credentials.region,
      s3_secret_access_key: s3_vcap_services['s3'][0].credentials.secret_access_key,
    };
  }
};

const getS3Client = () => {
  const { s3_access_key_id, s3_region, s3_secret_access_key } = getS3Config();
  return new S3Client({
    credentials: {
      accessKeyId: s3_access_key_id,
      secretAccessKey: s3_secret_access_key,
    },
    region: s3_region,
  });
};

const retrieveFileFromS3 = async (filename) => {
  const { s3_bucket } = getS3Config();
  const command = new GetObjectCommand({
    Bucket: s3_bucket,
    Key: filename,
  });

  try {
    const response = await getS3Client().send(command);
    if (!response || !response.Body) {
      log.error('S3 file response body is empty');
    }
    return await response?.Body;
  } catch (error) {
    log.error(`S3 error retrieving file: ${error}`);
    throw error;
  }
};

const uploadFileToS3 = async (filename, content, contentType) => {
  const { s3_bucket } = getS3Config();
  const command = new PutObjectCommand({
    Bucket: s3_bucket,
    Key: filename,
    Body: content,
    ContentType: contentType,
  });

  try {
    const response = await getS3Client().send(command);
    if (!response) {
      log.error('S3 file upload response is empty');
    }
    return response;
  } catch (error) {
    log.error(`S3 error uploading file: ${error}`);
    throw error;
  }
};

module.exports = {
  retrieveFileFromS3,
  uploadFileToS3,
};
