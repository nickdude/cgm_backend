const express = require('express');
const userController = require('../../controllers/user.controller');
const upload = require('../../middlewares/upload.middleware');

const router = express.Router();

router.get('/:userId', userController.getProfile);
router.put('/:userId', userController.updateProfile);
router.post('/:userId/photo', upload.single('image'), userController.uploadProfilePhoto);

module.exports = router;
