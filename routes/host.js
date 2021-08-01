const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isModeratorAtLeast, isPermitted } = require('../middleware');

const host = require('../controllers/host');


router.route('/')
   .get(catchAsync(host.renderMain));

router.route('/explore')
   .get(catchAsync(host.renderExplore));



router.route('/about')
   .get(catchAsync(host.renderAboutUs));


router.route('/contact')
   .get(catchAsync(host.renderContactUs))
   .post(catchAsync(host.sendEmail));

router.route('/guide')
   .get(catchAsync(host.renderGuide));

router.route('/policy')
   .get(catchAsync(host.renderPolicy));





module.exports = router;