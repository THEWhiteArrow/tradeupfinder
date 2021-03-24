const mongoose = require('mongoose');
const { Schema } = mongoose;
const Skin = require('./skinModel');

const caseSchema = new Schema({
   name: {
      type: String,
      required: [true, 'Collection must have a name!']
   },
   skins: {
      grey: [
         {
            type: Schema.Types.ObjectId,
            ref: 'Skin'
         }
      ],
      light_blue: [
         {
            type: Schema.Types.ObjectId,
            ref: 'Skin'
         }
      ],
      blue: [
         {
            type: Schema.Types.ObjectId,
            ref: 'Skin'
         }
      ],
      purple: [
         {
            type: Schema.Types.ObjectId,
            ref: 'Skin'
         }
      ],
      pink: [
         {
            type: Schema.Types.ObjectId,
            ref: 'Skin'
         }
      ],
      red: [
         {
            type: Schema.Types.ObjectId,
            ref: 'Skin'
         }
      ]
   }
});

const Case = mongoose.model('Case', caseSchema);
module.exports = Case;