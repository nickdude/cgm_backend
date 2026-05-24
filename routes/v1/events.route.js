const express = require('express');
const eventsController = require('../../controllers/events.controller');

const router = express.Router();

router.get('/:userId', eventsController.getEvents);

module.exports = router;
