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
   },
   pricesType: {
      type: String,
   }

});


module.exports = mongoose.model('Trade', tradeSchema);