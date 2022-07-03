const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin, isModeratorAtLeast, isPermitted } = require('../middleware');

const skin = require('../controllers/skins');




router.route('/database/update')
    .get(isLoggedIn, isModeratorAtLeast, isPermitted, catchAsync(skin.databaseUpdate))

router.route('/database/validate')
    .get(isLoggedIn, isModeratorAtLeast, isPermitted, catchAsync(skin.checkEmptyPrices))

router.route('/database')
    .get(isLoggedIn, isModeratorAtLeast, isPermitted, catchAsync(skin.showSkinsDb))




router.route('/update-icons')
    .get(isLoggedIn, isAdmin, isPermitted, catchAsync(skin.getSkinsIcons));

router.route('/update')
    .get(catchAsync(skin.updatePrices));

router.route('/update/:id')
    .post(isLoggedIn, isModeratorAtLeast, isPermitted, catchAsync(skin.updateSkinPrice))



router.route('/update-thru-servers')
    .get(isLoggedIn, isModeratorAtLeast, isPermitted, catchAsync(skin.useServers));





module.exports = router;