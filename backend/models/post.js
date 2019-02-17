const mongoose = require('mongoose');
const UserModel = require('./user');

const Schema = mongoose.Schema;

const postSchema = Schema({
  creator: {type: Schema.ObjectId, ref:'User', required:true, childPath: "posts", validateExistence: true },
  date: {type: Date, required:true},
  content: {type: String},
  hasImage: {type: Boolean},
  imagesPath: [{type: String}],
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

postSchema.pre('validate', next => {
  if(this.content == null && this.hasImage=="false") next(new Error('post must have at least content or image'));
  else next();
})

module.exports = mongoose.model('Post', postSchema);
