const ExpressError = require('./utils/ExpressError');

module.exports.isCorrectServer = (req, res, next) => {
   if (req.server != 'local' && req.query.cookie != 'readLast') {
      throw new ExpressError("Access Denied. Those servers are not meant to conduct such calculations", 401);
   }
   next();
};