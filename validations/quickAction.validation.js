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

const parseActionTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const sanitizeImageUrls = (imageUrls) => {
  if (!Array.isArray(imageUrls)) {
    return [];
  }

  return imageUrls
    .map((url) => String(url).trim())
    .filter(Boolean);
};

const validateDietPayload = (payload = {}) => {
  const errors = {};
  const sanitizedData = {};

  const actionTime = parseActionTime(payload.actionTime);
  if (!actionTime) {
    errors.actionTime = 'actionTime must be a valid ISO date';
  } else {
    sanitizedData.actionTime = actionTime;
  }

  const dietType = String(payload.dietType || '').trim();
  if (!dietType) {
    errors.dietType = 'dietType is required';
  } else {
    sanitizedData.dietType = dietType;
  }

  const foodName = String(payload.foodName || '').trim();
  if (!foodName) {
    errors.foodName = 'foodName is required';
  } else {
    sanitizedData.foodName = foodName;
  }

  sanitizedData.imageUrls = sanitizeImageUrls(payload.imageUrls);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
};

const validateInsulinPayload = (payload = {}) => {
  const errors = {};
  const sanitizedData = {};

  const actionTime = parseActionTime(payload.actionTime);
  if (!actionTime) {
    errors.actionTime = 'actionTime must be a valid ISO date';
  } else {
    sanitizedData.actionTime = actionTime;
  }

  const insulinName = String(payload.insulinName || '').trim();
  if (!insulinName) {
    errors.insulinName = 'insulinName is required';
  } else {
    sanitizedData.insulinName = insulinName;
  }

  sanitizedData.imageUrls = sanitizeImageUrls(payload.imageUrls);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
};

const validateMedicinePayload = (payload = {}) => {
  const errors = {};
  const sanitizedData = {};

  const actionTime = parseActionTime(payload.actionTime);
  if (!actionTime) {
    errors.actionTime = 'actionTime must be a valid ISO date';
  } else {
    sanitizedData.actionTime = actionTime;
  }

  const medicineName = String(payload.medicineName || '').trim();
  if (!medicineName) {
    errors.medicineName = 'medicineName is required';
  } else {
    sanitizedData.medicineName = medicineName;
  }

  sanitizedData.imageUrls = sanitizeImageUrls(payload.imageUrls);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
};

const validateExercisePayload = (payload = {}) => {
  const errors = {};
  const sanitizedData = {};

  const actionTime = parseActionTime(payload.actionTime);
  if (!actionTime) {
    errors.actionTime = 'actionTime must be a valid ISO date';
  } else {
    sanitizedData.actionTime = actionTime;
  }

  const exerciseName = String(payload.exerciseName || '').trim();
  if (!exerciseName) {
    errors.exerciseName = 'exerciseName is required';
  } else {
    sanitizedData.exerciseName = exerciseName;
  }

  sanitizedData.imageUrls = sanitizeImageUrls(payload.imageUrls);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
};

const validateFingerBloodPayload = (payload = {}) => {
  const errors = {};
  const sanitizedData = {};

  const actionTime = parseActionTime(payload.actionTime);
  if (!actionTime) {
    errors.actionTime = 'actionTime must be a valid ISO date';
  } else {
    sanitizedData.actionTime = actionTime;
  }

  const status = String(payload.status || '').trim();
  if (!status) {
    errors.status = 'status is required';
  } else {
    sanitizedData.status = status;
  }

  const bgmValue = Number(payload.bgmValue);
  if (!Number.isFinite(bgmValue) || bgmValue < 0) {
    errors.bgmValue = 'bgmValue must be a valid non-negative number';
  } else {
    sanitizedData.bgmValue = bgmValue;
  }

  sanitizedData.unit = String(payload.unit || 'mmol/L').trim() || 'mmol/L';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
};

module.exports = {
  validateUserId,
  validateDietPayload,
  validateInsulinPayload,
  validateMedicinePayload,
  validateExercisePayload,
  validateFingerBloodPayload,
};
