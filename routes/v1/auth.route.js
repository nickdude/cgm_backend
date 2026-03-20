const express = require('express');
const authController = require('../../controllers/auth.controller');

const router = express.Router();

// Mobile OTP Login Routes
router.post('/request-otp', authController.requestOTP);
router.post('/verify-otp', authController.verifyOTPLogin);

// Social Login Routes
router.post('/apple', authController.appleLogin);
router.post('/google', authController.googleLogin);
router.post('/facebook', authController.facebookLogin);

module.exports = router;
