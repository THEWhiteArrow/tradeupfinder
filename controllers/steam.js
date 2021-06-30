module.exports.showSteam = async (req, res) => {
   res.render('steam/index', { user: req.user });
};

module.exports.showAccount = async (req, res) => {
   res.render('steam/account', { user: req.user });
}
module.exports.logoutFromSteam = async (req, res) => {
   req.logout();
   res.redirect('/auth');
}

module.exports.returnToSite = async (req, res) => {
   //TUTAJ DODAWANIE UZYTKOWNIKA ZE STEAMA DO BAZY DANYCH, CHYBA (?)
   // console.log(req.user)
   res.redirect('/auth');
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