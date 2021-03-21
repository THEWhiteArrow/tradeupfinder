const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const skin = require('../controllers/skins');

router.route('/')
   .get(catchAsync(skin.mapDatabase));

router.route('/value')
   .get(catchAsync(skin.managePrice));

router.route('/delete')
   .get(catchAsync(skin.deleteDatabase));

router.route('/clear')
   .get(skin.clear)


module.exports = router;