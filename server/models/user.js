const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  posts: [ {type: Schema.ObjectId, ref:'Post'} ]
})

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
