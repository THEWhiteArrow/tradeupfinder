const mongoose = require('mongoose');
const { Schema } = mongoose;
// const Case = require('./caseModel');

const skinSchema = new Schema({
   name: {
      type: String,
      required: [true, 'Skin must have a name!']
   },
   rarity: {
      type: String,
      required: [true, 'Skin must be of certain rarity!']
   },
   skin: {
      type: String,
      required: [true, "Skin must have it's own skin!"]
   },
   min_float: {
      type: Number,
      required: [true, "Skin must have it's minimal float!"]
   },
   max_float: {
      type: Number,
      required: [true, "Skin must have it's maximal float!"]
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
      floated: {
         type: Object
      }
   },
   floatedQualities: {
      type: Object,
   }

   // case: {
   //    type: Schema.Types.ObjectId,
   //    ref: 'Case'
   // }
});

const Skin = mongoose.model('Skin', skinSchema);
module.exports = Skin;