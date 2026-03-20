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

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
};

const validateOnboardingPayload = (payload = {}) => {
  const errors = {};
  const sanitizedData = {};

  const requiredStringFields = [
    'diabetesType',
    'glucoseUnit',
    'cgmSensor',
    'activityLevel',
    'dietaryPattern',
  ];

  requiredStringFields.forEach((field) => {
    const value = payload[field];
    if (typeof value !== 'string' || !value.trim()) {
      errors[field] = `${field} is required`;
    } else {
      sanitizedData[field] = value.trim();
    }
  });

  const weight = toNumberOrNull(payload.weight);
  if (weight === null || Number.isNaN(weight) || weight <= 0) {
    errors.weight = 'weight must be a valid positive number';
  } else {
    sanitizedData.weight = weight;
  }

  const height = toNumberOrNull(payload.height);
  if (height === null || Number.isNaN(height) || height <= 0) {
    errors.height = 'height must be a valid positive number';
  } else {
    sanitizedData.height = height;
  }

  const hba1c = toNumberOrNull(payload.hba1c);
  if (hba1c === null || Number.isNaN(hba1c) || hba1c < 0) {
    errors.hba1c = 'hba1c must be a valid non-negative number';
  } else {
    sanitizedData.hba1c = hba1c;
  }

  const targetLow = toNumberOrNull(payload.targetLow);
  const targetHigh = toNumberOrNull(payload.targetHigh);
  if (targetLow === null || Number.isNaN(targetLow) || targetLow < 0) {
    errors.targetLow = 'targetLow must be a valid non-negative number';
  } else {
    sanitizedData.targetLow = targetLow;
  }

  if (targetHigh === null || Number.isNaN(targetHigh) || targetHigh < 0) {
    errors.targetHigh = 'targetHigh must be a valid non-negative number';
  } else {
    sanitizedData.targetHigh = targetHigh;
  }

  if (Number.isFinite(targetLow) && Number.isFinite(targetHigh) && targetHigh <= targetLow) {
    errors.targetRange = 'targetHigh must be greater than targetLow';
  }

  const diagnosisDate = new Date(payload.diagnosisDate);
  if (!payload.diagnosisDate || Number.isNaN(diagnosisDate.getTime())) {
    errors.diagnosisDate = 'diagnosisDate must be a valid ISO date';
  } else {
    sanitizedData.diagnosisDate = diagnosisDate;
  }

  if (!Array.isArray(payload.medications) || payload.medications.length === 0) {
    errors.medications = 'medications must be a non-empty array';
  } else {
    sanitizedData.medications = payload.medications
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (!Array.isArray(payload.comorbidities) || payload.comorbidities.length === 0) {
    errors.comorbidities = 'comorbidities must be a non-empty array';
  } else {
    sanitizedData.comorbidities = payload.comorbidities
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (payload.progress !== undefined) {
    sanitizedData.progress = String(payload.progress);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
};

module.exports = {
  validateUserId,
  validateOnboardingPayload,
};
