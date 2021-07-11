const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin, isModeratorAtLeast, isPermitted } = require('../middleware');

const skin = require('../controllers/skins');



// router.route('/')
//    .get(catchAsync(skin.showMain));

router.route('/database')
   .get(catchAsync(skin.showSkinsDb));

router.route('/database/validate')
   .get(isLoggedIn, isModeratorAtLeast, catchAsync(skin.checkEmptyPrices))


// router.route('/trades')
//    .get(catchAsync(skin.prepareTrades));

// router.route('/mixed-algorithm')
//    .get(catchAsync(isResearchAllowed), catchAsync(skin.mixedAlgorithm));



router.route('/update-icons')
   .get(isLoggedIn, isAdmin, isPermitted, catchAsync(skin.getSkinsIcons));

router.route('/update')
   .get(catchAsync(skin.updatePrices));
// .get(isLoggedIn, isAdmin, isPermitted, catchAsync(skin.updatePrices));

router.route('/update/:id')
   .post(isLoggedIn, isModeratorAtLeast, isPermitted, catchAsync(skin.updateSkinPrice))



router.route('/update-thru-servers')
   .post(isLoggedIn, isAdmin, isPermitted, catchAsync(skin.useServers));





module.exports = router;