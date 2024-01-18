const { S3Client } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_KEY_ACCESS,
  },
});

console.log(process.env.S3_SECRET_KEY_ACCESS,process.env.S3_ACCESS_KEY_ID)
module.exports = s3Client;
