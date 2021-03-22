const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const skin = require('../controllers/skins');



router.route('/')
   .get(catchAsync(skin.showIndex));

router.route('/update')
   .get(catchAsync(skin.updatePrices));

router.route('/check')
   .get(catchAsync(skin.checkTrades));





module.exports = router;