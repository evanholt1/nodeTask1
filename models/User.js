const mongoose = require('mongoose')
require('mongoose-type-email')
var uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new mongoose.Schema({
  username:{
    type:String,
    required:true,
    max:255,
    min:3,
    unique:true
  },
  password:{
    type:String,
    required:true,
    min:3,
    max:1024
  },
  email:{
    type:mongoose.SchemaTypes.Email,
    required:true,
    min:3,
    max:255,
    unique:true
  },
  date:{
    type:Date,
    default:Date.now
  }
});

// Apply the uniqueValidator plugin to userSchema.
UserSchema.plugin(uniqueValidator);

module.exports = User = mongoose.model("User",UserSchema)