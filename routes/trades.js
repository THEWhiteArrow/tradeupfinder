const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin, isModeratorAlso, isPermitted, isResearchAllowed } = require('../middleware');

const trade = require('../controllers/trades');



router.route('/:tradeId')
   .get(catchAsync(trade.showTrade));





module.exports = router;