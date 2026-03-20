const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const {
  validateMobileLogin,
  validateOTPVerification,
  validateSocialLogin,
} = require('../validations/auth.validation');

// Mobile OTP Login - Step 1: Send OTP
const requestOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    const validation = validateMobileLogin(mobile);
    if (!validation.isValid) {
      throw new ApiError(400, JSON.stringify(validation.errors));
    }

    const result = await authService.sendOTP(mobile);

    const response = new ApiResponse(200, result.message, {
      mobile: result.mobile,
      ...(result.devOtp && { devOtp: result.devOtp }),
    });

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Mobile OTP Login - Step 2: Verify OTP
const verifyOTPLogin = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    const validation = validateOTPVerification(mobile, otp);
    if (!validation.isValid) {
      throw new ApiError(400, JSON.stringify(validation.errors));
    }

    const result = await authService.verifyOTP(mobile, otp);

    const response = new ApiResponse(200, 'Login successful', result);

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Apple ID Login
const appleLogin = async (req, res, next) => {
  try {
    const { identityToken, user: userDetails } = req.body;

    const validation = validateSocialLogin(identityToken, 'apple');
    if (!validation.isValid) {
      throw new ApiError(400, JSON.stringify(validation.errors));
    }

    if (!userDetails || !userDetails.appleId) {
      throw new ApiError(400, 'Apple user details are required');
    }

    const result = await authService.verifyAppleLogin(identityToken, userDetails);

    const response = new ApiResponse(200, 'Apple login successful', result);

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Google Login
const googleLogin = async (req, res, next) => {
  try {
    const { idToken, user: userDetails } = req.body;

    const validation = validateSocialLogin(idToken, 'google');
    if (!validation.isValid) {
      throw new ApiError(400, JSON.stringify(validation.errors));
    }

    if (!userDetails || !userDetails.googleId) {
      throw new ApiError(400, 'Google user details are required');
    }

    const result = await authService.verifyGoogleLogin(idToken, userDetails);

    const response = new ApiResponse(200, 'Google login successful', result);

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Facebook Login
const facebookLogin = async (req, res, next) => {
  try {
    const { accessToken, user: userDetails } = req.body;

    const validation = validateSocialLogin(accessToken, 'facebook');
    if (!validation.isValid) {
      throw new ApiError(400, JSON.stringify(validation.errors));
    }

    if (!userDetails || !userDetails.facebookId) {
      throw new ApiError(400, 'Facebook user details are required');
    }

    const result = await authService.verifyFacebookLogin(accessToken, userDetails);

    const response = new ApiResponse(200, 'Facebook login successful', result);

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestOTP,
  verifyOTPLogin,
  appleLogin,
  googleLogin,
  facebookLogin,
};
