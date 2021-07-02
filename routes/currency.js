const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const currency = require('../controllers/currency');



router.route('/')
   .post(catchAsync(currency.setCurrency));

router.route('/update')
   .get(catchAsync(currency.updateCurrencyMultipliers));



module.exports = router;