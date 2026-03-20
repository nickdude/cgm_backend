const express = require('express');
const quickActionController = require('../../controllers/quickAction.controller');
const upload = require('../../middlewares/upload.middleware');

const router = express.Router();

router.post('/:userId/diet', upload.array('images', 10), quickActionController.saveDiet);
router.post('/:userId/insulin', upload.array('images', 10), quickActionController.saveInsulin);
router.post('/:userId/medicine', upload.array('images', 10), quickActionController.saveMedicine);
router.post('/:userId/exercise', upload.array('images', 10), quickActionController.saveExercise);
router.post('/:userId/finger-blood', quickActionController.saveFingerBlood);

module.exports = router;
