const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const home = require('../controllers/home');



router.route('/')
   .get(catchAsync(home.renderHome));





module.exports = router;