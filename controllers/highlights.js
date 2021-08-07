const Trade = require('../models/tradeModel');
const Favourite = require('../models/favouriteModel');
const Highlight = require('../models/highlightModel');

module.exports.manageHighlightTrade = async (req, res) => {
   console.log(req.url)
   const { action, highlightName = 'noname' } = req.query;
   const { orginalTradeId } = req.params;

   const doesExist = await Trade.any({ _id: orginalTradeId });

   if (doesExist) {

      const orginalTrade = await Trade.findById(orginalTradeId).populate('highlightedTrade');

      if (orginalTrade.isHighlighted == false && action == 'add') {
         // ADDING NEW HIGHLIGHT
         const newHighlightId = await addNewHighlight(orginalTrade, highlightName);
         return res.json({ success: true, action });
      }
      else if (orginalTrade.isHighlighted == true && action == 'delete') {
         // DELETING THE HIGHLIGHT THAT IS CONNECTED TO ORGINAL TRADE ID
         await deleteHighlight(orginalTrade);
         return res.json({ success: true, action });
      }
      else {
         // IN CASE OF CONFLICT JUST FORWARDING THE RESPONSE IN ORDER TO CHANGE STATE ON THE SITE
         return res.json({ success: true, action })
      }
   } else {

      try {

         if (action === 'add') {

            const user = req.user;
            createNewLegacyAndHighlight(user, orginalTradeId, highlightName)
            return res.json({ success: true, action });
         } else if (action === 'delete') {

            await deleteLegacyHighlight(orginalTradeId);
            return res.json({ success: true, action });
         }
      } catch (e) {

         return res.json({ success: false, message: `Wtf ?!?. Stop playing around here! ${e}` })


      }

   }
}

const deleteHighlight = async (orginalTrade) => {

   await Highlight.findByIdAndDelete(orginalTrade.highlightedTrade._id);

   const doesExist = Trade.any({ _id: orginalTrade._id });
   if (doesExist) {
      await Trade.findByIdAndUpdate(orginalTrade._id, { isHighlighted: false, highlightedTrade: null });
   }
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

const createNewLegacyAndHighlight = async (user, orginalTradeId, highlightName) => {

   const favouriteTrade = await Favourite.findOne({ owner: user._id, orginalTradeId });

   const newLegacyTrade = new Trade({
      name: orginalTradeId,
      arrays: favouriteTrade.arrays,
      data: favouriteTrade.data,
      statistics: favouriteTrade.statistics,
      pricesType: favouriteTrade.pricesType,
      favouritesInfo: {},
      isHighlighted: true,
   })

   newLegacyTrade.favouritesInfo[user._id] = favouriteTrade._id

   await newLegacyTrade.save();

   const newHighlightTrade = addNewHighlight(newLegacyTrade, highlightName)


   const updatedFavouriteTrade = await Favourite.findByIdAndUpdate(
      favouriteTrade._id,
      {
         orginalTrade: newLegacyTrade,
         orginalTradeId: newLegacyTrade._id,
      }
   )

}

const deleteLegacyHighlight = async (orginalTradeId) => {

   const legacyTrade = await Trade.find({ name: orginalTradeId })

   await deleteHighlight(legacyTrade);

}

