const ExpressError = require('./utils/ExpressError');
const Favourite = require('./models/favouriteModel');
const Trade = require('./models/tradeModel');

module.exports.isLoggedIn = (req, res, next) => {
   if (!req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl;
      req.flash('error', 'You must be signed in first!');
      return res.redirect('/user/login')
   }
   next();
};

module.exports.isAdmin = async (req, res, next) => {
   const permissionrole = { admin: true, moderator: false, guest: false };
   res.locals.permissionrole = permissionrole;
   next();
};

module.exports.isModeratorAlso = async (req, res, next) => {
   const permissionrole = { admin: true, moderator: true, guest: false };
   res.locals.permissionrole = permissionrole;
   next();
};

module.exports.isPermitted = async (req, res, next) => {
   const { role } = req.user;
   if (!res.locals.permissionrole[role]) {
      req.flash('error', 'You do not have a permission to do that!')
      return res.redirect(`/skins`);
   }
   next();
};


module.exports.userOwnsFavouriteTradeUp = async (req, res, next) => {
   const { favouriteId, } = req.params;

   const user = req.user;

   console.log(user, favouriteId)
   const doesExist = await Favourite.any({ _id: favouriteId });

   if (doesExist) {


      for (let id of user.favourites) {
         if (id == favouriteId) {
            return next();
         }
      }

   }

   return res.json({ success: false });




}

module.exports.isFavouriteTradeAuthorized = async (req, res, next) => {
   const { favouriteId, orginalTradeId } = req.params;
   const { action = null } = req.query;
   const user = req.user;

   console.log(user, favouriteId)
   const doesExist = await Favourite.any({ _id: favouriteId });


   if (action == 'add') return next();
   if (action == 'delete') {

      if (doesExist) {

         for (let id of user.favourites) {
            if (id == favouriteId) {
               return next();
            }
         }
         return res.json({ success: false, message: 'You are not authorized to do that!' })

      } else {
         return res.json({ success: true, conflict: true, action, message: 'That favourite trade does not exist anyway!' })

      }



   }
   return res.json({ success: false, message: 'Action is defined!' })











   // if (action == 'delete') {

   //    if (doesExist == true) {

   //       for (let id of user.favourites) {
   //          if (id == favouriteId) {
   //             return next();
   //          }
   //       }
   //    } else {
   //       return res.json({ success: true, action, conflict: true });
   //    }

   // } else if (action == 'add') {

   //    const orginalTrade = await Trade.findById(orginalTradeId);
   //    for (let id of user.favourites) {
   //       const index = orginalTrade.favourites.indexOf(id);
   //       if (index != -1) {
   //          return res.json({ success: true, action, newFavouriteId: id, conflict: true })
   //       }
   //    }

   //    return next();


   // } else {

   //    return res.json({ success: false });
   // }


}

module.exports.isResearchAllowed = async (req, res, next) => {
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


module.exports.ensureSteamAuthenticated = (req, res, next) => {
   if (req.isAuthenticated()) { return next(); }
   res.redirect('/auth');
}

