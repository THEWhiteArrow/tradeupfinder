const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const map = require('../controllers/mapping');

const { isLoggedIn, isAdmin, isModeratorAtLeast, isPermitted, favouriteTradeAuthorized } = require('../middleware');


router.route('/map-collection')
   .get(isLoggedIn, isAdmin, isPermitted, catchAsync(map.showMappingPage))
   .post(catchAsync(map.mapCollection));

router.route('/map-collection/floats')
   .get(isLoggedIn, isAdmin, isPermitted, catchAsync(map.mapFloatsGet))
   .post(catchAsync(map.mapFloatsPost));




module.exports = router;