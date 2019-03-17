module.exports = (mongoose) => {
  mongoose.connect(
    process.env.MONGO_CONN_STR,
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
