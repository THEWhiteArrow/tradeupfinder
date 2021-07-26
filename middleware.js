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

module.exports.isModeratorAtLeast = async (req, res, next) => {
   const permissionrole = { admin: true, moderator: true, guest: false };
   res.locals.permissionrole = permissionrole;
   next();
};

module.exports.isPermitted = async (req, res, next) => {
   if (req.user) {

      const { role } = req.user;
      if (!res.locals.permissionrole[role]) {
         req.flash('error', 'You do not have a permission to do that!')
         return res.redirect(`/`);
      }
      next();
   } else {
      req.flash('error', 'You are not permitted to do that!')
      return res.redirect(`/`);

   }
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
   const { orginalTradeId } = req.params;
   const { action = null } = req.query;
   const userId = req.user._id;


   const doesExist = await Trade.any({ _id: orginalTradeId });
   if (action == 'add' && doesExist) {
      return next();
   } else if (action == 'add' && !doesExist) {
      return res.json({ success: false, message: 'The trade thta you are trying to add does not exist!' })
   }

   if (action == 'delete') {

      const doesFavouriteExist = await Favourite.any({ orginalTrade: orginalTradeId, owner: userId })
      if (doesFavouriteExist) {
         return next();

      } else {
         return res.json({ success: true, conflict: true, action, message: 'That favourite trade does not exist already!' })
      }

   }


   return res.json({ success: false, message: 'Action is not defined!' })




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
   const { action, q } = req.query;

   if (action === 'display' || q == 'random') return next();

   if (action !== 'display' && action !== 'nothing' && action !== 'save') {
      req.flash('error', 'Incorrect type of action')
      return res.redirect('/')
   }


   if (action === 'nothing' || action === 'save') {
      if (!req.isAuthenticated()) {
         req.session.returnTo = req.originalUrl;
         req.flash('error', 'You do not have a permission to do that');
         return res.redirect('/')
      } else {
         const { role } = req.user;
         if (role !== 'admin') {
            req.flash('error', 'You do not have a permission to do that!')
            return res.redirect(`/`);
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

