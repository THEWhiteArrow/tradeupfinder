const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin, isModeratorAtLeast, isPermitted } = require('../middleware');

const skin = require('../controllers/skins');





router.route('/database')
   .get(isLoggedIn, isModeratorAtLeast, isPermitted, catchAsync(skin.showSkinsDb));

router.route('/database/validate')
   .get(isLoggedIn, isModeratorAtLeast, catchAsync(skin.checkEmptyPrices))




router.route('/update-icons')
   .get(isLoggedIn, isAdmin, isPermitted, catchAsync(skin.getSkinsIcons));

router.route('/update')
   .get(catchAsync(skin.updatePrices));

router.route('/update/:id')
   .post(isLoggedIn, isModeratorAtLeast, isPermitted, catchAsync(skin.updateSkinPrice))



router.route('/update-thru-servers')
   .get(isLoggedIn, isModeratorAtLeast, isPermitted, catchAsync(skin.useServers));





module.exports = router;