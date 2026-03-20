const express = require('express');
const healthRoute = require('./health.route');
const authRoute = require('./auth.route');

const router = express.Router();

router.use('/health', healthRoute);
router.use('/auth', authRoute);

module.exports = router;
