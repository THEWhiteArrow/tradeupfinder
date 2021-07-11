const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const host = require('../controllers/host');



router.route('/')
   .get(catchAsync(host.renderHome));

router.route('/main')
   .get(catchAsync(host.renderMain));





module.exports = router;