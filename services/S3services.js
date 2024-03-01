const AWS = require("aws-sdk");

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_IAM_USER_KEY,
  secretAccessKey: process.env.AWS_IAM_USER_SECRET,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const uploadToS3 = (data, filename) => {
  return new Promise((resolve, reject) => {
    const BUCKET_NAME = process.env.AWS_BUCKET;
    const params = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: data,
      ACL: "public-read",
    };

    s3.upload(params, (err, s3response) => {
      if (err) {
        console.error("Something went wrong", err);
        reject(err);
      } else {
        console.log("Success", s3response);
        resolve(s3response.Location);
      }
    });
  });
};

module.exports = {
  uploadToS3,
};
