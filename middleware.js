const ExpressError = require('./utils/ExpressError');



module.exports.isCorrectServer = (req, res, next) => {
   if (res.locals.server != 'local' && req.query.action != 'display') {
      throw new ExpressError("Access Denied. Those servers are not meant to conduct such calculations", 401);
   }
   next();
};