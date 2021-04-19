const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const map = require('../controllers/mapping');



router.route('/map-collection')
   .get(catchAsync(map.showMappingPage))
   .post(catchAsync(map.mapCollection));

router.route('/map-collection/floats')
   .get(catchAsync(map.mapFloatsGet))
   .post(catchAsync(map.mapFloatsPost));




module.exports = router;