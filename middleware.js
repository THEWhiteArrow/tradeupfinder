const ExpressError = require('./utils/ExpressError');
const Favourite = require('./models/favouriteModel');

const isLoggedIn = (req, res, next) => {
   if (!req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl;
      req.flash('error', 'You must be signed in first!');
      return res.redirect('/user/login')
   }
   next();
};

const isAdmin = async (req, res, next) => {
   const permissionrole = { admin: true, moderator: false, guest: false };
   res.locals.permissionrole = permissionrole;
   next();
};

const isModeratorAlso = async (req, res, next) => {
   const permissionrole = { admin: true, moderator: true, guest: false };
   res.locals.permissionrole = permissionrole;
   next();
};

const isPermitted = async (req, res, next) => {
   const { role } = req.user;
   if (!res.locals.permissionrole[role]) {
      req.flash('error', 'You do not have a permission to do that!')
      return res.redirect(`/skins`);
   }
   next();
};


const userOwnsFavouriteTradeUp = async (req, res, next) => {
   const { favouriteId } = req.params;
   const user = req.user;

   console.log(user, favouriteId)

   for (let id of user.favourites) {
      if (id == favouriteId) {
         return next();
      }
   }


   res.json({ success: false });

}

const isFavouriteTradeAuthorized = async (req, res, next) => {
   const { tradeId, favouriteId } = req.params;
   const { user } = req;
   const { action } = req.query;

   if (action === 'add') return next();




   if (action === 'delete' || action === undefined) {

      //any is faster than exists
      const doesExist = await Favourite.any({ _id: favouriteId });
      console.log('doesExist? : ', doesExist)
      if (doesExist) {

         for (let favourite of user.favourites) {
            if (favourite._id == favouriteId) return next()
         }
      } else {
         res.locals.doesExist = false;
         return res.json({ success: true, action: 'delete' });
      }

   }

   if (action === undefined) res.json({ success: false })


   req.flash('error', 'You do not own that trade-up OR trade-up that you have tried to delete does not exist!');
   return res.redirect(`/skins`);
}

const isResearchAllowed = async (req, res, next) => {
   const { action } = req.query;

   if (action !== 'display' && action !== 'nothing' && action !== 'save') {
      req.flash('error', 'Incorrect type of action')
      return res.redirect('/skins')
   }

   if (action === 'display') return next();

   if (action === 'nothing' || action === 'save') {
      if (!req.isAuthenticated()) {
         req.session.returnTo = req.originalUrl;
         req.flash('error', 'You do not have a permission to do that');
         return res.redirect('/skins')
      } else {
         const { role } = req.user;
         if (role !== 'admin') {
            req.flash('error', 'You do not have a permission to do that!')
            return res.redirect(`/skins`);
         } else {
            return next();
         }
      }
   }


}

module.exports = { isLoggedIn, isAdmin, isModeratorAlso, isPermitted, isResearchAllowed, isFavouriteTradeAuthorized, userOwnsFavouriteTradeUp };
