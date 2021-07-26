const mongoose = require('mongoose');
const { Schema } = mongoose;
const any = require('../plugins/mongoose/any');

const favouriteSchema = new Schema({
   owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
   },
   orginalTradeId: {
      type: String,
   },
   orginalTrade: {
      type: Schema.Types.ObjectId,
      ref: 'Trade'
   },


   name: {
      type: String,
   },
   pricesType: {
      type: String,
   },
   arrays: {
      type: Object
   },
   statistics: {
      type: Object
   },
   data: {
      type: Object
   },

});

favouriteSchema.plugin(any);
module.exports = mongoose.model('Favourite', favouriteSchema);