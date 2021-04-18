const mongoose = require('mongoose');
const { Schema } = mongoose;

const nameSchema = new Schema({
   name: {
      type: String,
   },

});

const Name = mongoose.model('Name', nameSchema);
module.exports = Name;