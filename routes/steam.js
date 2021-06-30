const express = require('express');
const router = express.Router({ mergeParams: true });
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const { ensureSteamAuthenticated } = require('../middleware');

const steam = require('../controllers/steam');


router.route('/')
   .get(steam.showSteam)


router.route('/account')
   .get(ensureSteamAuthenticated, steam.showAccount)

router.route('/logout')
   .get(steam.logoutFromSteam)



router.route('/steam')
   .get(passport.authenticate('steam', { failureRedirect: '/auth' }), steam.callbackError)



// GET /auth/steam/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.route('/steam/return')
   .get((req, res, next) => { req.url = req.originalUrl; next(); }, passport.authenticate('steam', { failureRedirect: '/auth' }), steam.returnToSite)


module.exports = router;