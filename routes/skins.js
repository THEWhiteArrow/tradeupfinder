const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const skin = require('../controllers/skins');



router.route('/')
   .get(catchAsync(skin.showIndex));

router.route('/update')
   .get(catchAsync(skin.updatePrices));









router.route('/mapp')
   .get(catchAsync(skin.mapDatabase));

router.route('/value')
   .get(catchAsync(skin.managePrice));

router.route('/delete')
   .get(catchAsync(skin.deleteDatabase));

router.route('/clear')
   .get(skin.clear)

router.route('/test')
   .get(catchAsync(skin.test));

// router.route('/update')
//    .get(catchAsync(skin.update));


module.exports = router;