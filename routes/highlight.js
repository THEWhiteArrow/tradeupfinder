const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isModeratorAlso, isPermitted } = require('../middleware');

const highlight = require('../controllers/highlights');

router.route('/:orginalTradeId')
   .get(isLoggedIn, isModeratorAlso, isPermitted, catchAsync(highlight.manageHighlightTrade))



module.exports = router;