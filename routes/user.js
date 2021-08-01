const express = require('express');
const router = express.Router({ mergeParams: true });
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware');

const users = require('../controllers/users');



router.route('/register')
   .get(users.renderRegister)
   .post(catchAsync(users.register));


router.route('/login')
   .get(users.renderLogin)
   .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/user/login' }), catchAsync(users.login))

router.route('/account')
   .get(isLoggedIn, catchAsync(users.renderAccountPage));



router.get('/logout', catchAsync(users.logout))


module.exports = router;