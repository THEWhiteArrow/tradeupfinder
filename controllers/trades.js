const fetch = require('node-fetch');

const Trade = require('../models/tradeModel');
const Highlight = require('../models/highlightModel');
const steamTax = 0.87;


module.exports.showTrade = async (req, res) => {
   const { tradeId } = req.params;
   const profit = await Trade.findOne({ _id: tradeId })
   res.render('trades/show', { profit })
}

module.exports.recheckStats = async (req, res) => {

   // EDITING GLOBALLY SETTING UP AND CHECKING PERMISSION
   const { editGloballySwitch = 'false' } = req.body;
   const { user } = req;
   let userPermittedToEditGlobally = false;
   if (user && (user.role == 'admin' || user.role == 'moderator')) {
      userPermittedToEditGlobally = true;
   }


   const { currency } = req.session;
   const { tradeId } = req.params;

   try {
      const foundTrade = await Trade.findById(tradeId);
      const firstPrice = Math.round(req.body[foundTrade.instance.trade.firstSkin._id] / currency.multiplier * 100) / 100;
      const secondPrice = Math.round(req.body[foundTrade.instance.trade.secondSkin._id] / currency.multiplier * 100) / 100;

      const { amount, instance, pricesType } = foundTrade;
      const { targetedSkinsNumber, trade } = instance;

      const { firstSkin, secondSkin } = trade;
      const firstCollection = firstSkin.case;
      const secondCollection = secondSkin.case;

      let total = 0;

      let newTargetedSkin = {}
      let newMaxPrice = 0;



      for (let i = 0; i < trade.targetedSkinsArr.length; i++) {
         let newPrice = Math.round(req.body[trade.targetedSkinsArr[i]._id] / currency.multiplier * steamTax * 100) / 100;

         if (newPrice > newMaxPrice) {
            newTargetedSkin = {
               _id: trade.targetedSkinsArr[i]._id,
               name: trade.targetedSkinsArr[i].name,
               skin: trade.targetedSkinsArr[i].skin,
               case: trade.targetedSkinsArr[i].case,
               rarity: trade.targetedSkinsArr[i].rarity,
               min_float: trade.targetedSkinsArr[i].min_float,
               max_float: trade.targetedSkinsArr[i].max_float,
               float: trade.targetedSkinsArr[i].float,
               price: trade.targetedSkinsArr[i][pricesType][trade.targetedSkinsArr[i].quality],
               targetedQuality: trade.targetedSkinsArr[i].quality,
               icon: trade.targetedSkinsArr[i].icon,
            }
            newMaxPrice = newPrice;
         }


         trade.targetedSkinsArr[i].price = newPrice;

         if (trade.targetedSkinsArr[i].case == firstCollection && trade.targetedSkinsArr[i].case == secondCollection) {
            total += (newPrice * 10);
         } else if (trade.targetedSkinsArr[i].case == firstCollection) {
            total += (newPrice * Number(amount.amount1));
         } else if (trade.targetedSkinsArr[i].case == secondCollection) {
            total += (newPrice * Number(amount.amount2));
         }

      }


      let wantedOutputChance = 0;
      const inputPrice = Math.round((amount.amount1 * firstPrice + amount.amount2 * secondPrice) * 100) / 100;


      for (let outputSkin of trade.targetedSkinsArr) {
         if (inputPrice <= outputSkin.price) {
            wantedOutputChance += outputSkin.amount;
         }

      }

      const avgPrice = total / targetedSkinsNumber;
      const profitPerTradeUp = Math.round((avgPrice - inputPrice) * 100) / 100;
      const returnPercentage = Math.round(((avgPrice) / inputPrice * 100) * 100) / 100;


      instance.total = total;
      instance.wantedOutputChance = wantedOutputChance;
      instance.chances = Math.round(wantedOutputChance / targetedSkinsNumber * 10000) / 100;
      instance.trade.targetedSkin = newTargetedSkin
      instance.trade.firstPrice = firstPrice;
      instance.trade.secondPrice = secondPrice;
      instance.trade.targetedPrice = newMaxPrice;
      instance.trade.inputPrice = inputPrice;
      instance.trade.profitPerTradeUp = profitPerTradeUp;
      instance.trade.returnPercentage = returnPercentage;
      instance.trade.targetedSkinsArr = trade.targetedSkinsArr;


      // UPDATING IF EDIT GLOBALLY SWITCH AND IF USER ALLOWED
      if (editGloballySwitch && userPermittedToEditGlobally) {

         if (foundTrade.isHighlighted) {

            if (returnPercentage > 100) {
               const updatedTrade = await Trade.findByIdAndUpdate(foundTrade._id, { instance })
               const updatedHighlight = await Highlight.findByIdAndUpdate(foundTrade.highlightedTrade, { instance })
            } else {
               const updatedTrade = await Trade.findByIdAndUpdate(foundTrade._id, { instance, isHighlighted: false })
               // WTEDY USUŃ HIGHLIGHT BO JUZ NIE JEST OPŁACALNY
               await Highlight.findByIdAndDelete(foundTrade.highlightedTrade)
            }
         } else {
            const updatedTrade = await Trade.findByIdAndUpdate(foundTrade._id, { instance }, { new: true })
         }

      }


      const feedback = {
         success: true,
         inputPrice: Math.round(inputPrice * currency.multiplier * 100) / 100,
         profitPerTradeUp: Math.round(profitPerTradeUp * currency.multiplier * 100) / 100,
         returnPercentage,
         wantedOutputChance,
         targetedSkinsNumber,
         firstPrice: Math.round(firstPrice * currency.multiplier * 100) / 100,
         secondPrice: Math.round(secondPrice * currency.multiplier * 100) / 100,
         targetedPrice: Math.round(newMaxPrice * currency.multiplier * 100) / 100,
         symbol: currency.symbol,
         chances: Math.round(wantedOutputChance / targetedSkinsNumber * 10000) / 100,
         editedGlobally: editGloballySwitch,
      };
      res.json(feedback);
   } catch (e) {
      console.log(e)

      const feedback = { success: false };
      res.json(feedback);
   }
}



module.exports.updateCurrentTradesByOuterServer = async (req, res) => {

   // const response = fetch('http://localhost:8080/trades/update-current', {
   const response = fetch('https://steam-market2.herokuapp.com/trades/update-current', {
      method: 'GET',
      headers: {
         'auth-token': process.env.HEADERS_TOKEN
      }
   })

   const trades = await Trade.find({});
   const numberOfTrades = trades.length;
   const estimatedTime = Math.round(numberOfTrades / 5 * 100) / 100;

   req.flash('success', `Current trades are being refreshed! ESTIMATED TIME : ${estimatedTime} seconds`)
   res.redirect('/skins')

}