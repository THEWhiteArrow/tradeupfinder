const { sortingTrades } = require('../utils/functions');
const Favourite = require('../models/favouriteModel');
const User = require('../models/userModel');
const Trade = require('../models/tradeModel');

// NUMBER BY WHICH YOU NEED TO MULTIPLY TO SIMULATE MONEY THAT YOU ARE LEFT WITH, AFTER STEAM TAXES YOUR SELLING
const steamTax = 0.87;
const maxShownSkins = 200;
const steamBaseUrl = 'https://steamcommunity.com/market/listings/730/';

module.exports.manageFavouriteTrade = async (req, res) => {
   const { user } = req;
   const userId = user._id;
   const { action } = req.query;
   const { orginalTradeId, favouriteId } = req.params;

   console.log(action)
   console.log(orginalTradeId, favouriteId)

   try {


      if (action === 'add') {

         const baseTrade = await Trade.findById(orginalTradeId);
         // console.log(baseTrade)
         const { favourites } = user;

         const newFavouriteTrade = new Favourite({
            amount: baseTrade.amount,
            priceCorrection: baseTrade.priceCorrection,
            name: baseTrade.name,
            instance: baseTrade.instance,
            pricesType: baseTrade.pricesType,
            orginalTrade: baseTrade
         })

         const childrenOfBaseTrade = baseTrade.favourites;
         childrenOfBaseTrade.push(newFavouriteTrade);
         const updatedOrginalTrade = await Trade.findByIdAndUpdate(orginalTradeId, { favourites: childrenOfBaseTrade }, { new: true });

         console.log(updatedOrginalTrade)


         favourites.push(newFavouriteTrade);
         await newFavouriteTrade.save();

         const updatedUser = await User.findByIdAndUpdate(userId, { favourites: favourites }, { new: true });

         console.log('added')

         const newFavouriteId = newFavouriteTrade._id;
         const feedback = { success: true, action, newFavouriteId };
         res.json(feedback);
      } else {


         await User.findByIdAndUpdate(userId, { $pull: { favourites: favouriteId } });

         const doesExist = Trade.any({ _id: orginalTradeId });
         if (doesExist) {
            await Trade.findByIdAndUpdate(orginalTradeId, { $pull: { favourites: favouriteId } });
         }

         await Favourite.findByIdAndDelete(favouriteId);



         console.log('deleted')
         const feedback = { success: true, action };
         res.json(feedback);
      }

   } catch (e) {
      console.log(e)
      const feedback = { success: false, action };
      res.json(feedback);
   }

}

module.exports.displayFavouriteTrades = async (req, res) => {
   const { user, sort = 'returnPercentage', order = 'descending' } = req;

   const foundUser = await User.findById(user._id)
      // .populate('favourites')
      .populate({ path: 'favourites', populate: 'orginalTrade' })

   let favourites = foundUser.favourites;


   const sortedFavourites = sortingTrades(favourites, sort, order);

   res.render('favourites/index', { favouriteTrades: sortedFavourites, maxShownSkins, steamBaseUrl })
}

module.exports.recheckFavouriteStats = async (req, res) => {

   const originUrl = req.originalUrl;
   console.log(originUrl)
   const { firstPrice, secondPrice } = req.body;
   const { favouriteId } = req.params;

   try {
      const favouriteTrade = await Favourite.findById(favouriteId);
      const { amount, instance } = favouriteTrade;
      const { targetedSkinsNumber, trade } = instance;
      // console.log(favouriteTrade.instance.total)
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

      const updatedFavourite = await Favourite.findByIdAndUpdate(favouriteId, { instance }, { new: true });

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

module.exports.renderFavouriteEditPage = async (req, res) => {
   const { favouriteId } = req.params;
   const favouriteTrade = await Favourite.findById(favouriteId);

   res.render('favourites/show', { favouriteTrade })
}

