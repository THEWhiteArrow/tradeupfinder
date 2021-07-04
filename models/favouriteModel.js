const mongoose = require('mongoose');
const { Schema } = mongoose;
const any = require('../plugins/mongoose/any');

const favouriteSchema = new Schema({
   owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
   },
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
   orginalTrade: {
      type: Schema.Types.ObjectId,
      ref: 'Trade'
   },
   pricesType: {
      type: String,
   }

});

favouriteSchema.plugin(any);
module.exports = mongoose.model('Favourite', favouriteSchema);