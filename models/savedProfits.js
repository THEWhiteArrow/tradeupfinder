const mongoose = require('mongoose');
const { Schema } = mongoose;

const profitSchema = new Schema({
   name: {
      type: String
   },
   profits: {
      type: Array
   },
   counterOpt: {
      type: String
   },
   positiveResults: {
      type: String,
   },
   amount: {
      type: Object
   }
});

const Profit = mongoose.model('Profit', profitSchema);
module.exports = Profit;