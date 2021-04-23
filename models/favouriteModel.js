const mongoose = require('mongoose');
const { Schema } = mongoose;

const favouriteSchema = new Schema({
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
   originalTradeId: {
      type: String
   },
   pricesType: {
      type: String,
   }

});

module.exports = mongoose.model('Favourite', favouriteSchema);