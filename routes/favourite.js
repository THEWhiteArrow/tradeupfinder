const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, userOwnsFavouriteTradeUp, isFavouriteTradeAuthorized } = require('../middleware');

const favourite = require('../controllers/favourites');

router.route('/manage/:orginalTradeId/:favouriteId')
   .get(isLoggedIn, isFavouriteTradeAuthorized, favourite.manageFavouriteTrade)

router.route('/:favouriteId')
   .post(isLoggedIn, userOwnsFavouriteTradeUp, catchAsync(favourite.recheckFavouriteStats))

router.route('/')
   .get(isLoggedIn, catchAsync(favourite.displayFavouriteTrades))




module.exports = router;