const mongoose = require('mongoose');

const validateUserId = (userId) => {
  const errors = {};

  if (!userId) {
    errors.userId = 'User id is required';
  } else if (!mongoose.Types.ObjectId.isValid(userId)) {
    errors.userId = 'Invalid user id';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const normalizeMobile = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }

  return digits.length > 10 ? digits.slice(-10) : digits;
};

const validateUpdateProfile = (payload = {}) => {
  const errors = {};
  const sanitizedData = {};

  const allowedFields = ['email', 'phone', 'fullName', 'photoUrl', 'onboardingComplete'];

  const hasAnyAllowedField = allowedFields.some((field) => payload[field] !== undefined);
  if (!hasAnyAllowedField) {
    errors.body = `At least one of ${allowedFields.join(', ')} is required`;
    return { isValid: false, errors, sanitizedData };
  }

  if (payload.email !== undefined) {
    const email = String(payload.email).trim().toLowerCase();
    if (!email) {
      errors.email = 'Email cannot be empty';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    } else {
      sanitizedData.email = email;
    }
  }

  if (payload.phone !== undefined) {
    const phone = normalizeMobile(String(payload.phone));
    if (!phone) {
      errors.phone = 'Phone cannot be empty';
    } else if (!/^\d{10}$/.test(phone)) {
      errors.phone = 'Phone must be a valid 10-digit mobile number';
    } else {
      sanitizedData.mobile = phone;
    }
  }

  if (payload.fullName !== undefined) {
    const fullName = String(payload.fullName).trim();
    if (!fullName) {
      errors.fullName = 'Full name cannot be empty';
    } else if (fullName.length > 100) {
      errors.fullName = 'Full name must be less than 100 characters';
    } else {
      sanitizedData.name = fullName;
    }
  }

  if (payload.photoUrl !== undefined) {
    const photoUrl = payload.photoUrl === null ? null : String(payload.photoUrl).trim();
    if (photoUrl && !/^https?:\/\//i.test(photoUrl)) {
      errors.photoUrl = 'photoUrl must be a valid http/https URL';
    } else {
      sanitizedData.profileImage = photoUrl;
    }
  }

  if (payload.onboardingComplete !== undefined) {
    if (typeof payload.onboardingComplete !== 'boolean') {
      errors.onboardingComplete = 'onboardingComplete must be boolean';
    } else {
      sanitizedData.onboardingComplete = payload.onboardingComplete;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
};

module.exports = {
  validateUserId,
  validateUpdateProfile,
};
