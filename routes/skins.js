const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin, isModeratorAlso, isPermitted, isResearchAllowed, isFavouriteTradeAuthorized } = require('../middleware');

const skin = require('../controllers/skins');



router.route('/')
   .get(catchAsync(skin.showIndex));

router.route('/show-database')
   .get(catchAsync(skin.showSkinsDb));

// router.route('/trades')
//    .get(catchAsync(skin.prepareTrades));

router.route('/mixed-algorithm')
   .get(catchAsync(isResearchAllowed), catchAsync(skin.mixedAlgorithm));

router.route('/trades/favourites')
   .get(isLoggedIn, catchAsync(skin.displayFavouriteTrades))

router.route('/trades/favourites/:tradeId')
   .post(isLoggedIn, isFavouriteTradeAuthorized, catchAsync(skin.recheckFavouriteStats))



router.route('/update')
   .get(catchAsync(skin.updatePrices));
// .get(isLoggedIn, isAdmin, isPermitted, catchAsync(skin.updatePrices));

router.route('/update/:id')
   .post(isLoggedIn, isModeratorAlso, isPermitted, catchAsync(skin.updateSkinPrice))



router.route('/update-thru-servers')
   .post(isLoggedIn, isAdmin, isPermitted, catchAsync(skin.useServers));

router.route('/delete-trades')
   .delete(isLoggedIn, isAdmin, catchAsync(skin.deleteSavedTrades));



module.exports = router;