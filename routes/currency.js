const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isModeratorAlso, isPermitted } = require('../middleware');

const currency = require('../controllers/currency');


router.route('/')
   .get(catchAsync(currency.setCurrency));

router.route('/update')
   .get(isModeratorAlso, isPermitted, catchAsync(currency.updateCurrencyMultipliers));



module.exports = router;