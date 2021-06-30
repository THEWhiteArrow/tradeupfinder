const mongoose = require('mongoose');
const { Schema } = mongoose;
const any = require('../plugins/mongoose/any');

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
   },

   favourites: [{
      type: Schema.Types.ObjectId,
      ref: 'Favourite'
   }],

   isHighlighted: {
      type: Boolean,
   },
   highlightedTrade: {
      type: Schema.Types.ObjectId,
      ref: 'Highlight'
   }

});

tradeSchema.plugin(any);
module.exports = mongoose.model('Trade', tradeSchema);