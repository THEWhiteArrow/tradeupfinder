const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
   email: {
      type: String,
      required: true,
      unique: true
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

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);