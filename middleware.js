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

const isFavouriteTradeAuthorized = async (req, res, next) => {
   const { tradeId } = req.params;
   const { user } = req;
   const { action } = req.query;

   console.log(action)
   if (action === 'add') return next();
   if (action === 'delete' || action === undefined) {

      for (let favourite of user.favourites) {
         if (favourite._id == tradeId) return next()
      }

   }

   if (action === undefined) res.json({ success: false })

   req.flash('error', 'You do not own that trade up!')
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

module.exports = { isLoggedIn, isAdmin, isModeratorAlso, isPermitted, isResearchAllowed, isFavouriteTradeAuthorized };
