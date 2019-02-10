const path = require('path');
var AWS = require('aws-sdk')

AWS.config.update({
  accessKeyId: process.env.IAM_USER_KEY,
  secretAccessKey: process.env.IAM_USER_SECRET,
  region: 'eu-west-3'
});

const s3 = new AWS.S3();


const MIME_TYPE_MAP = {
  'image/png':'png',
  'image/jpeg':'jpeg',
  'image/jpg' :'jpg',
  'image/gif' :'gif'
};

module.exports = (file) => {
  const valid = MIME_TYPE_MAP[file.mimetype];
  if(!valid) throw Error('invalid mimetype');
  let filename = file.name.split(' ').join('-').toLowerCase()+'.'+MIME_TYPE_MAP[file.mimetype];

  let params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `images/${filename}`,
    Body: file.data
  }

  s3.upload(params, (err,data)=> {
    if(err) throw err;
  });
  return filename;
}
