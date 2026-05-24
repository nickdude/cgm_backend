const express = require('express');
const dataController = require('../../controllers/data.controller');

const router = express.Router();

router.get('/:userId', dataController.getDataPage);

module.exports = router;
