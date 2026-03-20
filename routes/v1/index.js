const express = require('express');
const healthRoute = require('./health.route');

const router = express.Router();

router.use('/health', healthRoute);

module.exports = router;
