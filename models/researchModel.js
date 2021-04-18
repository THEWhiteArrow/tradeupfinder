const mongoose = require('mongoose');
const { Schema } = mongoose;

const researchSchema = new Schema({
   name: {
      type: String,
   },
   profits: {
      type: Array,
   },
   counterOpt: {
      type: String,
   },
   positiveResults: {
      type: String,
   },
   amount: {
      type: Object,
   },
   priceCorrection: {
      type: Number
   }

});

const Research = mongoose.model('Research', researchSchema);
module.exports = Research;