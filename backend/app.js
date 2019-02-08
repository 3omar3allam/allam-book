const FRONTEND_DIRNAME = 'angular';
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');

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

app.use('/images/:name', (req,res,next)=>{
    res.sendFile(path.join(__dirname,'images',req.params.name));
});

app.use('/',  express.static(path.join(__dirname,FRONTEND_DIRNAME)));

app.use("/posts",postsRoutes);
app.use("/auth", authRoutes);

app.use((req,res,next)=>{
  res.sendFile(path.join(__dirname,FRONTEND_DIRNAME,"index.html"));
});

module.exports = app;
