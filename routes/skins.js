const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin, isModeratorAlso, isPermitted, isResearchAllowed } = require('../middleware');

const skin = require('../controllers/skins');



router.route('/')
   .get(catchAsync(skin.showIndex));

// router.route('/trades')
//    .get(catchAsync(skin.prepareTrades));

router.route('/mixed-algorithm')
   .get(isResearchAllowed, catchAsync(skin.mixedAlgorithm));



router.route('/update')
   .get(isLoggedIn, isAdmin, isPermitted, catchAsync(skin.updatePrices));

router.route('/update/:id')
   .post(isLoggedIn, isModeratorAlso, isPermitted, catchAsync(skin.updateSkinPrice))



router.route('/update-thru-servers')
   .post(isLoggedIn, isAdmin, isPermitted, catchAsync(skin.useServers));

router.route('/delete-researches')
   .delete(isLoggedIn, isAdmin, catchAsync(skin.deleteSavedResearches));



module.exports = router;