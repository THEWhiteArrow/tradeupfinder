const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');
const any = require('../plugins/mongoose/any');

const userSchema = new Schema({
   steam: {
      id: {
         type: String,
      },
      avatar: {
         type: String
      }
   },
   email: {
      type: String,
      // required: true,
      // unique: true,
      // sparse: true,
   },
   role: {
      type: String,
      enum: ['guest', 'moderator', 'admin'],
      required: true
   },
   favourites: [
      {
         type: Schema.Types.ObjectId,
         ref: 'Favourite'
      }
   ]

});

userSchema.plugin(any);
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);