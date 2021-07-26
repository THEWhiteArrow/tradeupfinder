const { mergeSort, recheckTrade, isEmpty } = require('../utils/functions');
const Favourite = require('../models/favouriteModel');
const User = require('../models/userModel');
const Trade = require('../models/tradeModel');

// NUMBER BY WHICH YOU NEED TO MULTIPLY TO SIMULATE MONEY THAT YOU ARE LEFT WITH, AFTER STEAM TAXES YOUR SELLING
const steamTax = 0.87;
const maxShownSkins = 200;
const steamBaseUrl = 'https://steamcommunity.com/market/listings/730/';


const deleteFavourite = async (req, res) => {
   const userId = req.user._id;
   const { action } = req.query;
   const { orginalTradeId } = req.params;

   const deletedFavouriteTrade = await Favourite.findOneAndDelete({ orginalTrade: orginalTradeId, owner: userId });
   // console.log(deletedFavouriteTrade)

   await User.findByIdAndUpdate(userId, { $pull: { favourites: deletedFavouriteTrade._id } });



   const doesExist = await Trade.any({ _id: orginalTradeId });
   if (doesExist) {

      const orginalTrade = await Trade.findById(orginalTradeId);

      let { favouritesInfo } = orginalTrade;

      delete favouritesInfo[userId];
      await Trade.findByIdAndUpdate(orginalTradeId, { favouritesInfo }, { new: true });
   }



   console.log('deleted')
   const feedback = { success: true, action };
   res.json(feedback);
}

const addToFavourite = async (req, res) => {
   const { action } = req.query;
   const { user } = req;
   const userId = user._id;
   const { orginalTradeId } = req.params;

   // const doesExist = await Trade.any({ _id: orginalTradeId });
   // if (doesExist) {

   const orginalTrade = await Trade.findById(orginalTradeId);
   // console.log(orginalTrade._id);
   // console.log(orginalTrade.favouritesInfo);

   const { favouritesInfo } = orginalTrade;
   const owner = await User.findById(userId)
   let { favourites } = user;

   const newFavouriteTrade = new Favourite({
      owner,
      orginalTradeId: orginalTradeId,
      orginalTrade,


      name: orginalTrade.name,
      pricesType: orginalTrade.pricesType,
      arrays: orginalTrade.arrays,
      statistics: orginalTrade.statistics,
      data: orginalTrade.data,


   })
   const newFavouriteId = newFavouriteTrade._id;
   favouritesInfo[userId] = newFavouriteId;





   await Trade.findByIdAndUpdate(orginalTradeId, { favouritesInfo }, { new: true });
   // console.log(updatedOrginalTrade)


   favourites.push(newFavouriteTrade);
   await newFavouriteTrade.save();

   await User.findByIdAndUpdate(userId, { favourites }, { new: true });

   console.log('updated user!')
   console.log('added')
   const feedback = { success: true, action }
   res.json(feedback)
   // } else {
   //    const feedback = { success: false, action }
   //    res.json(feedback)

   // }
}

module.exports.manageFavouriteTrade = async (req, res) => {
   const { action } = req.query;

   console.log(action)



   if (action === 'add') {

      await addToFavourite(req, res);



   } else if (action == 'delete') {

      await deleteFavourite(req, res);
   }




}

module.exports.displayFavouriteTrades = async (req, res) => {
   const { user, sort = 'returnPercentage', order = 'descending' } = req;

   const favourites = await Favourite.find({ owner: user._id }).populate('orginalTrade');
   // console.log(favourites[0])
   const sortedFavourites = mergeSort(favourites, sort, order);


   res.render('favourites/index', { favouriteTrades: sortedFavourites, maxShownSkins, steamBaseUrl })
}

module.exports.renderFavouriteEditPage = async (req, res) => {
   const { favouriteId } = req.params;
   const favouriteTrade = await Favourite.findById(favouriteId).populate('orginalTrade');

   res.render('favourites/show', { favouriteTrade })
}

module.exports.recheckFavouriteStats = async (req, res) => {
   if (!isEmpty(req.body)) {
      const feedback = await recheckTrade(req, res, steamTax, Favourite, 'Favourite')
      res.json(feedback);
   } else {
      res.json({ success: false });
   }
}

