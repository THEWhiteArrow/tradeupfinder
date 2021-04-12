const mongoose = require('mongoose');
const { Schema } = mongoose;

const profitSchema = new Schema({
   profits: {
      type: Array
   },
   counterOpt: {
      type: String
   },
   positiveResults: {
      type: Number,
   },
   amount: {
      type: Object
   }
});

const Profit = mongoose.model('Profit', profitSchema);
module.exports = Profit;