const FRONTEND_DIRNAME = 'angular';
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');

const https = require('https');

const postsRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');

require('./mongo-config')(mongoose);

const app = express();

app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));


app.use('/',  express.static(path.join(__dirname,FRONTEND_DIRNAME)));

app.use("/posts",postsRoutes);
app.use("/auth", authRoutes);

app.get('/images/:name',(req,res) => {
  let externalReq = https.request(
    `https://${process.env.STORAGE_LOCATION}/${process.env.BUCKET_NAME}/images/${req.params.name}`,
    externalRes => externalRes.pipe(res)
  );
  externalReq.end();
});

app.use((req,res,next)=>{
  res.sendFile(path.join(__dirname,FRONTEND_DIRNAME,"index.html"));
});

module.exports = app;
