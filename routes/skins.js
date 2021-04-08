const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const skin = require('../controllers/skins');



router.route('/')
   .get(catchAsync(skin.showIndex));

router.route('/trades')
   .get(catchAsync(skin.prepareTrades));
router.route('/mixed-algorithm')
   .get(catchAsync(skin.mixedAlgorithm));



router.route('/update')
   .get(catchAsync(skin.updatePrices));

router.route('/updateAtOnce')
   .get(catchAsync(skin.updatePricesInOneReq));

router.route('/map-collection')
   .get(catchAsync(skin.showMappingPage))
   .post(catchAsync(skin.mapCollection));

router.route('/map-collection/floats')
   .get(catchAsync(skin.mapFloatsGet))
   .post(catchAsync(skin.mapFloatsPost));


router.route('/update-targeted-prices')
   .get(catchAsync(skin.updateTargetedPrices));

router.route('/update-thru-servers')
   .post(catchAsync(skin.useServers));





module.exports = router;