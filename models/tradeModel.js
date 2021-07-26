const mongoose = require('mongoose');
const { Schema } = mongoose;
const any = require('../plugins/mongoose/any');

const tradeSchema = new Schema({


   name: {
      type: String,
   },
   arrays: {
      type: Object
   },
   data: {
      type: Object
   },
   statistics: {
      type: Object
   },
   pricesType: {
      type: String,
   },

   // favourites: [{
   //    type: Schema.Types.ObjectId,
   //    ref: 'Favourite'
   // }],

   favouritesInfo: {
      type: Object,
   },

   isHighlighted: {
      type: Boolean,
   },
   highlightedTrade: {
      type: Schema.Types.ObjectId,
      ref: 'Highlight'
   }

}, { minimize: false });

tradeSchema.plugin(any);
module.exports = mongoose.model('Trade', tradeSchema);