const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isModeratorAtLeast, isPermitted } = require('../middleware');

const server = require('../controllers/server');


router.route('/validate')
   .get(isModeratorAtLeast, isPermitted, catchAsync(server.validOuterServerAction))







module.exports = router;