const mongoose = require('mongoose');
const { Schema } = mongoose;
// const Case = require('./caseModel');

const skinSchema = new Schema({
   name: {
      type: String,
      required: [true, 'Skin must have a name!']
   },
   prices: {
      'Factory New': {
         type: String,
      },
      'Minimal Wear': {
         type: String,
      },
      'Field-Tested': {
         type: String,
      },
      'Well-Worn': {
         type: String,
      },
      'Battle-Scarred': {
         type: String,
      },
   },
   rarity: {
      type: String,
   }
   // case: {
   //    type: Schema.Types.ObjectId,
   //    ref: 'Case'
   // }
});

const Skin = mongoose.model('Skin', skinSchema);
module.exports = Skin;