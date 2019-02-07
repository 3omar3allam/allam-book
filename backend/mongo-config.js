const MONGO_CONN_STR = `mongodb+srv://omar:${process.env.MONGO_ATLAS_PW}@cluster0-6xrfc.mongodb.net/mean-course`;
const mongoose = require('mongoose');

mongoose.connect(
    MONGO_CONN_STR,
    { useNewUrlParser: true, autoIndex: false }
  )
  .then(()=>{
    console.log('Connected to database!')
  })
  .catch((error)=>{
    console.log('Connection failed!');
    console.log(error);
  });
