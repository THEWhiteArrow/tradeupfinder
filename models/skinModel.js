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
   case: {
      type: String,
      required: [true, "Skin must belong to a collection!"]
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
         type: Number,
      },
      'Minimal Wear': {
         type: Number,
      },
      'Field-Tested': {
         type: Number,
      },
      'Well-Worn': {
         type: Number,
      },
      'Battle-Scarred': {
         type: Number,
      },
      // floated: {
      //    type: Object
      // }
   },
   // floatedQualities: {
   //    type: Object,
   // }

   // case: {
   //    type: Schema.Types.ObjectId,
   //    ref: 'Case'
   // }
});

const Skin = mongoose.model('Skin', skinSchema);
module.exports = Skin;