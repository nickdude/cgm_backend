const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const { generateOTP, generateTokens } = require('../utils/jwt.utils');

const OTP_EXPIRY_MINUTES = 5;

// Mobile OTP Login
const sendOTP = async (mobile) => {
  const normalizedMobile = mobile.replace(/\D/g, '').slice(-10);

  let user = await User.findOne({ mobile: normalizedMobile });

  if (!user) {
    user = new User({ mobile: normalizedMobile });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  user.otp = {
    code: otp,
    expiresAt,
    attempts: 0,
  };

  await user.save();

  // TODO: In production, send OTP via SMS service (Twilio, etc.)
  console.log(`📱 OTP for ${normalizedMobile}: ${otp}`);

  return {
    success: true,
    message: 'OTP sent successfully',
    mobile: normalizedMobile,
    ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
  };
};

const verifyOTP = async (mobile, otp) => {
  const normalizedMobile = mobile.replace(/\D/g, '').slice(-10);
  const isProduction = process.env.NODE_ENV === 'production';

  const user = await User.findOne({ mobile: normalizedMobile });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!user.otp || !user.otp.code) {
    throw new ApiError(400, 'No OTP request found. Please request OTP first.');
  }

  if (new Date() > user.otp.expiresAt) {
    throw new ApiError(400, 'OTP has expired');
  }

  if (isProduction && user.otp.attempts >= 3) {
    throw new ApiError(429, 'Too many OTP attempts. Please request a new OTP.');
  }

  if (user.otp.code !== otp) {
    user.otp.attempts += 1;
    await user.save();
    throw new ApiError(400, 'Invalid OTP');
  }

  user.otp = { code: null, expiresAt: null, attempts: 0 };
  user.lastLogin = new Date();
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);

  return {
    user: {
      id: user._id,
      mobile: user.mobile,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
    },
    tokens: { accessToken, refreshToken },
  };
};

// Social Auth Login
const verifyAppleLogin = async (identityToken, userDetails) => {
  // TODO: Verify identityToken with Apple's servers
  // This is a simplified version - in production, validate token with Apple

  let user = await User.findOne({ 'socialAuth.appleId': userDetails.appleId });

  if (!user) {
    user = new User({
      socialAuth: { appleId: userDetails.appleId },
      email: userDetails.email || null,
      name: userDetails.name || null,
      profileImage: userDetails.profileImage || null,
    });
  }

  user.lastLogin = new Date();
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
    },
    tokens: { accessToken, refreshToken },
  };
};

const verifyGoogleLogin = async (idToken, userDetails) => {
  // TODO: Verify idToken with Google's servers using google-auth-library

  let user = await User.findOne({ 'socialAuth.googleId': userDetails.googleId });

  if (!user) {
    user = new User({
      socialAuth: { googleId: userDetails.googleId },
      email: userDetails.email,
      name: userDetails.name,
      profileImage: userDetails.profileImage || null,
    });
  } else {
    // Update user info if changed
    user.email = userDetails.email || user.email;
    user.name = userDetails.name || user.name;
    if (userDetails.profileImage) user.profileImage = userDetails.profileImage;
  }

  user.lastLogin = new Date();
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
    },
    tokens: { accessToken, refreshToken },
  };
};

const verifyFacebookLogin = async (accessToken, userDetails) => {
  // TODO: Verify accessToken with Facebook Graph API

  let user = await User.findOne({ 'socialAuth.facebookId': userDetails.facebookId });

  if (!user) {
    user = new User({
      socialAuth: { facebookId: userDetails.facebookId },
      email: userDetails.email,
      name: userDetails.name,
      profileImage: userDetails.profileImage || null,
    });
  } else {
    user.email = userDetails.email || user.email;
    user.name = userDetails.name || user.name;
    if (userDetails.profileImage) user.profileImage = userDetails.profileImage;
  }

  user.lastLogin = new Date();
  await user.save();

  const { accessToken: appAccessToken, refreshToken } = generateTokens(user._id);

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
    },
    tokens: { accessToken: appAccessToken, refreshToken },
  };
};

module.exports = {
  sendOTP,
  verifyOTP,
  verifyAppleLogin,
  verifyGoogleLogin,
  verifyFacebookLogin,
};
