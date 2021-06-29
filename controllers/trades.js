const Trade = require('../models/tradeModel');

module.exports.showTrade = async (req, res) => {
   const { tradeId } = req.params;
   res.json({ success: true, tradeId });
}