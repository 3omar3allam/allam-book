const MONGO_CONN_STR = `mongodb+srv://omar:${process.env.MONGO_ATLAS_PW}@myapps-igpox.mongodb.net/allambook?retryWrites=true`;
const MONGO_TEST_CONN_STR = `mongodb+srv://omar:${process.env.MONGO_TEST_ATLAS_PW}@cluster0-6xrfc.mongodb.net/mean-course?retryWrites=true`

module.exports = (mongoose) => {
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
}
