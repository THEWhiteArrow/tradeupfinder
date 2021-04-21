const mongoose = require('mongoose');
const { Schema } = mongoose;

const tradeSchema = new Schema({
   amount: {
      type: Object,
   },
   priceCorrection: {
      type: Number,
   },
   name: {
      type: String,
   },
   instance: {
      type: Object
   }

});


module.exports = mongoose.model('Trade', tradeSchema);