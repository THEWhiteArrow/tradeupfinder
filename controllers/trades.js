const Trade = require('../models/tradeModel');

module.exports.showTrade = async (req, res) => {
   const { tradeId } = req.params;
   const profit = await Trade.findOne({ _id: tradeId })
   res.render('trades/show', { profit })
}