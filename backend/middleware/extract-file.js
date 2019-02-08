const path = require('path');

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
  file.mv(path.join(__dirname,'..','images',filename), err=>{
    if(err) throw err;
  });
  return filename;
}
