const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isModeratorAtLeast, isAdmin, isPermitted, isResearchAllowed } = require('../middleware');

const trade = require('../controllers/trades');

router.route('/')
   .get(catchAsync(isResearchAllowed), catchAsync(trade.renderTrades));

router.route('/custom-search')
   .get(isLoggedIn, isModeratorAtLeast, isPermitted, catchAsync(trade.customSearch));

router.route('/delete')
   .delete(isLoggedIn, isModeratorAtLeast, isPermitted, catchAsync(trade.deleteSavedTrades));

router.route('/update-current')
   .get(isModeratorAtLeast, isPermitted, catchAsync(trade.updateCurrentTradesByOuterServer))

router.route('/:tradeId')
   .get(trade.showTrade)
   .post(catchAsync(trade.recheckStats))






module.exports = router;