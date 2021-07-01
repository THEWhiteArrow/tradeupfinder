const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const trade = require('../controllers/trades');



router.route('/:tradeId')
   .get(trade.showTrade)
   .post(catchAsync(trade.recheckStats))





module.exports = router;