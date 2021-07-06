const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isModeratorAlso, isPermitted } = require('../middleware');

const server = require('../controllers/server');


router.route('/validate')
   .get(isModeratorAlso, isPermitted, catchAsync(server.validOuterServerAction))







module.exports = router;