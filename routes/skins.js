const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const skin = require('../controllers/skins');



router.route('/')
   .get(catchAsync(skin.showIndex));

router.route('/trades')
   .get(catchAsync(skin.prepareTrades));

router.route('/update')
   .get(catchAsync(skin.updatePrices));


router.route('/update-targeted-prices')
   .get(catchAsync(skin.updateTargetedPrices));

router.route('/update-thru-servers')
   .post(catchAsync(skin.useServers));





module.exports = router;