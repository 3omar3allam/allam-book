const mongoose = require('mongoose');

mongoose.connect(
    process.env.MONGO_CONN_STR,
    { useNewUrlParser: true, useCreateIndex: true }
  )
  .then(()=>{
    console.log('Connected to database!')
  })
  .catch((error)=>{
    console.log('Connection failed!');
    console.log(error);
  });
