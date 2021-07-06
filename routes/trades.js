const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isModeratorAlso, isPermitted } = require('../middleware');

const trade = require('../controllers/trades');


router.route('/update-current')
   .get(isModeratorAlso, isPermitted, catchAsync(trade.updateCurrentTradesByOuterServer))

router.route('/:tradeId')
   .get(trade.showTrade)
   .post(catchAsync(trade.recheckStats))






module.exports = router;