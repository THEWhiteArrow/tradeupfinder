const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const skin = require('../controllers/skins');



router.route('/')
   .get(catchAsync(skin.showIndex));

router.route('/update')
   .get(catchAsync(skin.updatePrices));

router.route('/trades')
   .get(catchAsync(skin.prepareTrades));





module.exports = router;