const ExpressError = require('../utils/ExpressError');
const User = require('../models/userModel');
const Trade = require('../models/tradeModel');
const Favourite = require('../models/favouriteModel');

module.exports.renderRegister = (req, res) => {
   res.render('users/register');
};

module.exports.register = async (req, res) => {
   try {
      const { username, email, password } = req.body;
      const role = 'guest';
      const user = new User({ email, username, role });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, err => {
         if (err) {
            next(err)
            // throw new ExpressError('Error occured during automatic attempt to log you in. Please do it by yourself.', 500);
         } else {
            req.flash('success', 'Właśnie założyłeś nowe konto na Kontrakciarze CS:GO! Witamy nowego kontrakciarza');
            res.redirect('/skins')
         }

      })

   } catch (e) {
      req.flash('error', e.message);
      res.redirect('/user/register')
   }
};

module.exports.renderLogin = (req, res) => {
   res.render('users/login');
};

module.exports.login = (req, res) => {
   const { user } = req;
   console.log(user)
   req.flash('success', `Welcome back ${user.username}! We have been waiting for your comeback and are content to have you here :) `);
   // const redirectUrl = req.session.returnTo || '/skins';
   const redirectUrl = '/skins';
   delete req.session.returnTo;
   res.redirect(redirectUrl)
};

module.exports.logout = (req, res) => {
   req.logout();
   req.flash('success', 'Goodbye!')
   res.redirect('/skins');
};


module.exports.manageFavouriteTrade = async (req, res) => {
   const { user } = req;
   const userId = user._id;
   const { action } = req.query;
   const { tradeId } = req.params;

   console.log(action)
   console.log(tradeId)
   try {

      const reqUser = await User.findById(userId);
      if (action === 'add') {

         const unSavedTrade = await Trade.findById(tradeId);
         const { favourites } = reqUser;

         const newFavouriteTrade = new Favourite({
            amount: unSavedTrade.amount,
            priceCorrection: unSavedTrade.priceCorrection,
            name: unSavedTrade.name,
            instance: unSavedTrade.instance,
            originalTradeId: tradeId
         })

         favourites.push(newFavouriteTrade);
         await newFavouriteTrade.save();
         const updatedUser = await User.findByIdAndUpdate(userId, { favourites: favourites }, { new: true });

         console.log('added')
         const newFavouriteId = newFavouriteTrade._id;
         const feedback = { success: true, action, newFavouriteId };
         res.json(feedback);
      } else {


         await User.findByIdAndUpdate(userId, { $pull: { favourites: tradeId } });
         await Favourite.findByIdAndDelete(tradeId);


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