const express = require('express');
const router = express.Router({ mergeParams: true });
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');

const users = require('../controllers/users');



router.route('/register')
   .get(users.renderRegister)
   .post(catchAsync(users.register));

router.route('/login')
   .get(users.renderLogin)
   .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/user/login' }), users.login)

router.route('/favourite/:tradeId/trade')
   .get(users.manageFavouriteTrade)


router.get('/logout', users.logout)


module.exports = router;