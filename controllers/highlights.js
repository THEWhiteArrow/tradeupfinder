const Trade = require('../models/tradeModel');
const Highlight = require('../models/highlightModel');

module.exports.manageHighlightTrade = async (req, res) => {
   console.log(req.url)
   const { action, highlightName = 'noname' } = req.query;
   const { orginalTradeId, highlightId } = req.params;

   const orginalTrade = await Trade.findById(orginalTradeId).populate('highlightedTrade');

   if (orginalTrade.isHighlighted == false && action == 'add') {
      // ADDING NEW HIGHLIGHT
      const newHighlightId = await addNewHighlight(orginalTrade, highlightName);
      res.json({ success: true, action });
   }
   else if (orginalTrade.isHighlighted == true && action == 'delete') {
      // DELETING THE HIGHLIGHT THAT IS CONNECTED TO ORGINAL TRADE ID
      await deleteHighlight(orginalTrade);
      res.json({ success: true, action });
   }
   else {
      // IN CASE OF CONFLICT JUST FORWARDING THE RESPONSE IN ORDER TO CHANGE STATE ON THE SITE
      res.json({ success: true, action })
   }
}

const deleteHighlight = async (orginalTrade) => {
   await Highlight.findByIdAndDelete(orginalTrade.highlightedTrade._id);
   await Trade.findByIdAndUpdate(orginalTrade._id, { isHighlighted: false, highlightedTrade: null });
}

const addNewHighlight = async (orginalTrade, highlightName) => {

   const newHighlightTrade = new Highlight({
      amount: orginalTrade.amount,
      priceCorrection: orginalTrade.priceCorrection,
      name: orginalTrade.name,
      instance: orginalTrade.instance,
      pricesType: orginalTrade.pricesType,
      orginalTrade: orginalTrade,
      highlightName
   });

   await newHighlightTrade.save();

   await Trade.findByIdAndUpdate(orginalTrade._id,
      {
         isHighlighted: true,
         highlightedTrade: newHighlightTrade
      });

   return newHighlightTrade._id;
}