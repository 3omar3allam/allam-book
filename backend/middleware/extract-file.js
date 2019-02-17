const path = require('path');
var AWS = require('aws-sdk');
const fileType = require('file-type');

AWS.config.update({
  accessKeyId: process.env.IAM_USER_KEY,
  secretAccessKey: process.env.IAM_USER_SECRET,
  region: 'eu-west-3'
});

const s3 = new AWS.S3();

//
// const MIME_TYPE_MAP = {
//   'image/png':'png',
//   'image/jpeg':'jpeg',
//   'image/jpg' :'jpg',
//   'image/gif' :'gif'
// };
//
// module.exports = (file) => {
//   const valid = MIME_TYPE_MAP[file.mimetype];
//   if(!valid) throw Error('invalid mimetype');
//   let filename = file.name.split(' ').join('-').toLowerCase()+'.'+MIME_TYPE_MAP[file.mimetype];
//
  // let params = {
  //   Bucket: process.env.BUCKET_NAME,
  //   Key: `images/${filename}`,
  //   Body: file.data
  // }
  //
  // s3.upload(params, (err,data)=> {
  //   if(err) throw err;
  // });
//   return filename;
// }



const validTypes = [
  'image/png',
  'image/gif'
];

module.exports = (req,res,next) => {
  if(!req.files || !req.files.image){
    next();
  }
  else {
    var files = req.files.image;
    if(!files.length) files = [files]; //to handle single and multiple images the same way

    filenames = [];

    files.forEach((image,_,files) => {
      const {mime, ext} = fileType(image.data);
      if(!validTypes.includes(mime) || mime != image.mimetype){
        req.uploadStatus = {
          success: false,
          error: "Invalid filetype!"
        };
      }
      else{
        let filename = image.name.split(' ').join('-').toLowerCase()+'.'+ext;

        let params = {
          Bucket: process.env.BUCKET_NAME,
          Key: `images/${filename}`,
          Body: image.data
        }

        s3.upload(params, (err,data)=> {
          if(err) {
            req.uploadStatus = {
              success: false,
              error: "Upload failed!"
            };
            next();
          }
          else {
            filenames.push(filename);
            if(filenames.length == files.length){
              req.uploadStatus = {
                success: true,
                filenames: filenames
              };
              next();
            }
          }
        });
      }
    });
  }
}
