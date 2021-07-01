const Trade = require('../models/tradeModel');
const steamTax = 0.87;


module.exports.showTrade = async (req, res) => {
   const { tradeId } = req.params;
   const profit = await Trade.findOne({ _id: tradeId })
   res.render('trades/show', { profit })
}

module.exports.recheckStats = async (req, res) => {

   const originUrl = req.originalUrl;
   console.log(originUrl)
   const { firstPrice, secondPrice } = req.body;
   const { tradeId } = req.params;

   try {
      const foundTrade = await Trade.findById(tradeId);
      const { amount, instance } = foundTrade;
      const { targetedSkinsNumber, trade } = instance;

      const { firstSkin, secondSkin, targetedSkin } = trade;
      const firstCollection = firstSkin.case;
      const secondCollection = secondSkin.case;

      let total = 0;
      let targetedPrice;



      for (let i = 0; i < trade.targetedSkinsArr.length; i++) {
         let newPrice = Math.round(req.body[trade.targetedSkinsArr[i]._id] * steamTax * 100) / 100;
         console.log(newPrice)
         trade.targetedSkinsArr[i].price = newPrice;

         if (targetedSkin.skin == trade.targetedSkinsArr[i].skin && targetedSkin.name == trade.targetedSkinsArr[i].name) {
            targetedPrice = newPrice;
         }


         if (trade.targetedSkinsArr[i].case == firstCollection && trade.targetedSkinsArr[i].case == secondCollection) {
            total += (newPrice * 10);
         } else if (trade.targetedSkinsArr[i].case == firstCollection) {
            total += (newPrice * Number(amount.amount1));
         } else if (trade.targetedSkinsArr[i].case == secondCollection) {
            total += (newPrice * Number(amount.amount2));
         }

      }

      console.log(targetedPrice)
      let wantedOutputChance = 0;
      const inputPrice = Math.round((amount.amount1 * firstPrice + amount.amount2 * secondPrice) * 100) / 100;


      for (let outputSkin of trade.targetedSkinsArr) {
         if (inputPrice <= outputSkin.price) {
            wantedOutputChance += outputSkin.amount;
         }
         // console.log(outputSkin.price, outputSkin.amount)
      }

      const avgPrice = total / targetedSkinsNumber;
      const profitPerTradeUp = Math.round((avgPrice - inputPrice) * 100) / 100;
      const returnPercentage = Math.round(((avgPrice) / inputPrice * 100) * 100) / 100;
      // ALSO WE HAVE wantedOutputChance
      // console.log('-------checked')

      instance.total = total;
      instance.wantedOutputChance = wantedOutputChance;
      instance.trade.firstPrice = firstPrice;
      instance.trade.secondPrice = secondPrice;
      instance.trade.targetedPrice = targetedPrice;
      instance.trade.inputPrice = inputPrice;
      instance.trade.profitPerTradeUp = profitPerTradeUp;
      instance.trade.returnPercentage = returnPercentage;
      instance.trade.targetedSkinsArr = trade.targetedSkinsArr;

      // const updatedFavourite = await Favourite.findByIdAndUpdate(tradeId, { instance }, { new: true });

      const feedback = {
         success: true,
         inputPrice,
         profitPerTradeUp,
         returnPercentage,
         wantedOutputChance,
         targetedSkinsNumber,
         firstPrice,
         secondPrice,
         targetedPrice
      };
      res.json(feedback);
   } catch (e) {
      // console.log('-------failed')
      console.log(e)

      const feedback = { success: false };
      res.json(feedback);
   }
}