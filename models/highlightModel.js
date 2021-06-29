const mongoose = require('mongoose');
const { Schema } = mongoose;
const any = require('../plugins/any');

const highlightSchema = new Schema({
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
   },
   highlightName: {
      type: String,
   },
   orginalTrade: {
      type: Schema.Types.ObjectId,
      ref: 'Trade'
   },

});

highlightSchema.plugin(any);
module.exports = mongoose.model('Highlight', highlightSchema);