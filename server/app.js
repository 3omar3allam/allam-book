const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const https = require('https');

require('./mongo-config');

const app = express();

app.use('', express.static(path.join(__dirname,'templates')));

app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

const postsRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
app.use("/api/posts",postsRoutes);
app.use("/api/auth", authRoutes);

app.get('/images/:name',(req,res) => {
  let externalReq = https.request(
    `https://${process.env.STORAGE_LOCATION}/${process.env.BUCKET_NAME}/images/${req.params.name}`,
    externalRes => externalRes.pipe(res)
  );
  externalReq.end();
});

app.use('*', express.static(path.join(__dirname,'templates')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
