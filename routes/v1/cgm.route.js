const express = require('express');
const cgmController = require('../../controllers/cgm.controller');

const router = express.Router();

router.post('/:userId/readings', cgmController.saveReadings);
router.get('/:userId/readings', cgmController.getReadings);

module.exports = router;
