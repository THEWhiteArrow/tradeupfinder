const mongoose = require('mongoose');
const { Schema } = mongoose;
const Skin = require('./skinModel');

const caseSchema = new Schema({
   name: {
      type: String,
      required: [true, 'Collection must have a name!']
   },
   skins: [
      {
         type: Schema.Types.ObjectId,
         ref: 'Skin'
      }
   ]
});

const Case = mongoose.model('Case', caseSchema);
module.exports = Case;