const mongoose = require('mongoose');
const UserModel = require('./user');

const Schema = mongoose.Schema;

const postSchema = Schema({
  creator: {type: Schema.ObjectId, ref:'User', required:true, childPath: "posts", validateExistence: true },
  date: {type: Date, required:true},
  content: {type: String, required:true},
  image: {
    required: false,
    type: Schema({
      name: {type:String, required:false},
      binary: {type: Buffer, required:true},
      type: {type: String, enum:['image/png','image/jpg','image/jpeg'], required:true},
    }),
  },
  comments: [ {
    required:false,
    type: Schema({
      by: {type:Schema.ObjectId, ref:'User', required: true},
      content: {type: String, required: true},
      image: {type: Buffer, required: false, default:null},
      date: {type: Date, required:true, default:Date.now },
    }),
  } ],
  edited: {type: Boolean, required: true, default: false},
});

module.exports = mongoose.model('Post', postSchema);