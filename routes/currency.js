const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isModeratorAtLeast, isPermitted } = require('../middleware');

const currency = require('../controllers/currency');


router.route('/')
   .get(catchAsync(currency.setCurrency));

router.route('/update')
   .get(isModeratorAtLeast, isPermitted, catchAsync(currency.updateCurrencyMultipliers));



module.exports = router;