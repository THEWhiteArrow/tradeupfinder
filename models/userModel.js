const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
   email: {
      type: String,
      required: true,
      unique: true
   },
   rank: {
      type: String,
      enum: ['guest', 'moderator', 'admin'],
      required: true
   }

});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);