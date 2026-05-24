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

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const parseNumber = (value) => {
  if (value == null || value === '') {
    return null;
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
};

const normalizeReadingPayload = (payload) => {
  const timestamp = payload.timestamp || payload.time || payload.recordedAt || payload.dateTime;
  const glucoseValue =
    payload.glucoseValue ?? payload.glucose ?? payload.bgmValue ?? payload.value ?? payload.reading;

  return {
    sensorId: payload.sensorId || payload.sensorSn || null,
    deviceType: payload.deviceType || null,
    source: payload.source || null,
    timestamp,
    glucoseValue,
    unit: payload.unit || 'mg/dL',
    trend: payload.trend || payload.direction || null,
    metadata: payload.metadata || null,
    rawPayload: payload,
  };
};

const validateCgmReadingsPayload = (payload = {}) => {
  const errors = {};
  const sanitizedData = {};
  let readings = [];

  if (Array.isArray(payload.readings)) {
    readings = payload.readings;
  } else if (Array.isArray(payload.data)) {
    readings = payload.data;
  } else if (payload.reading && typeof payload.reading === 'object') {
    readings = [payload.reading];
  } else if (typeof payload === 'object' && payload.timestamp != null) {
    readings = [payload];
  }

  if (readings.length === 0) {
    errors.readings = 'At least one CGM reading is required';
  }

  const sanitizedReadings = [];

  readings.forEach((rawItem, index) => {
    if (rawItem == null || typeof rawItem !== 'object') {
      errors[`readings[${index}]`] = 'Each reading must be an object';
      return;
    }

    const normalized = normalizeReadingPayload(rawItem);
    const timestamp = parseDate(normalized.timestamp);
    const glucoseValue = parseNumber(normalized.glucoseValue);

    const readingErrors = {};
    if (!timestamp) {
      readingErrors.timestamp = 'timestamp must be a valid ISO date or UNIX timestamp';
    }
    if (glucoseValue == null || glucoseValue < 0) {
      readingErrors.glucoseValue = 'glucoseValue must be a valid non-negative number';
    }

    if (Object.keys(readingErrors).length > 0) {
      errors[`readings[${index}]`] = readingErrors;
      return;
    }

    sanitizedReadings.push({
      userId: null,
      sensorId: normalized.sensorId,
      deviceType: normalized.deviceType,
      source: normalized.source,
      timestamp,
      glucoseValue,
      unit: String(normalized.unit || 'mg/dL').trim(),
      trend: String(normalized.trend || 'unknown').trim() || 'unknown',
      rawPayload: normalized.rawPayload,
      metadata: normalized.metadata,
    });
  });

  sanitizedData.readings = sanitizedReadings;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
};

const validateCgmQueryParams = (query = {}) => {
  const errors = {};
  const sanitizedData = {};

  if (query.startTime) {
    const startTime = parseDate(query.startTime);
    if (!startTime) {
      errors.startTime = 'startTime must be a valid ISO date or UNIX timestamp';
    } else {
      sanitizedData.startTime = startTime;
    }
  }

  if (query.endTime) {
    const endTime = parseDate(query.endTime);
    if (!endTime) {
      errors.endTime = 'endTime must be a valid ISO date or UNIX timestamp';
    } else {
      sanitizedData.endTime = endTime;
    }
  }

  if (query.limit) {
    const limit = parseNumber(query.limit);
    if (limit == null || limit <= 0) {
      errors.limit = 'limit must be a valid positive number';
    } else {
      sanitizedData.limit = Math.min(limit, 500);
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
  validateCgmReadingsPayload,
  validateCgmQueryParams,
};
