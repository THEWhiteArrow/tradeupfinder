module.exports.showSteam = async (req, res) => {
   res.render('steam/index', { user: req.user });
};

module.exports.showAccount = async (req, res) => {
   res.render('steam/account', { user: req.user });
}
module.exports.logoutFromSteam = async (req, res) => {
   req.logout();
   res.redirect('/main');
}

module.exports.returnToSite = async (req, res) => {

   sleep(2000); //xd
   req.flash('success', `Welcome on the board ${req.user.username}! Explore the opportunities and do not hesitate to seize them!`);
   res.redirect('/main');
}

module.exports.desanitizeQuery = async (req, res, next) => {
   console.log(req.user)
   const query = replaceForDesanitizedObj(req.query)

   req.query = query;
   next();

}

module.exports.callbackError = async (req, res, next) => {
   next(new ExpressError("Server's bad response", 500));
}

const replaceForDesanitizedObj = (obj) => {
   const newObj = {};

   const keys = Object.keys(obj);
   for (let k of keys) {
      // console.log(q.replaceAll('_', '.'))
      newObj[k.replaceAll('_', '.')] = obj[k];
   }

   return newObj;
}

const sleep = (delay) => {
   return new Promise((resolve, reject) => {
      setTimeout(() => {
         resolve();
      }, delay);
   })
}