const validateMobileLogin = (mobile) => {
  const errors = {};

  if (!mobile) {
    errors.mobile = 'Mobile number is required';
  } else if (!/^[0-9]{10}$/.test(mobile.replace(/\D/g, ''))) {
    errors.mobile = 'Invalid mobile number format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateOTPVerification = (mobile, otp) => {
  const errors = {};

  if (!mobile) {
    errors.mobile = 'Mobile number is required';
  }
  if (!otp) {
    errors.otp = 'OTP is required';
  } else if (!/^[0-9]{6}$/.test(otp)) {
    errors.otp = 'OTP must be 6 digits';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateSocialLogin = (socialToken, provider) => {
  const errors = {};

  if (!socialToken) {
    errors.token = `${provider} token is required`;
  }
  if (!['apple', 'google', 'facebook'].includes(provider)) {
    errors.provider = 'Invalid provider';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateMobileLogin,
  validateOTPVerification,
  validateSocialLogin,
};
