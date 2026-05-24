const User = require('../models/user.model');
const CgmReading = require('../models/cgmReading.model');
const ApiError = require('../utils/apiError');

const ensureActiveUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

const saveCgmReadings = async (userId, readings) => {
  await ensureActiveUser(userId);

  if (!Array.isArray(readings) || readings.length === 0) {
    console.log(`⚠️ CGM save skipped: empty readings payload for userId=${userId}`);
    return [];
  }

  console.log(
    `🧪 Normalized CGM save payload: userId=${userId}, count=${readings.length}, sample=${JSON.stringify(readings[0])}`
  );

  const operations = readings.map((item) => ({
    updateOne: {
      filter: {
        userId,
        timestamp: item.timestamp,
        glucoseValue: item.glucoseValue,
        sensorId: item.sensorId || null,
      },
      update: {
        $setOnInsert: { userId, ...item },
      },
      upsert: true,
    },
  }));

  const result = await CgmReading.bulkWrite(operations, { ordered: false });
  console.log(
    `🗄️ CGM bulkWrite result: userId=${userId}, inserted=${result.upsertedCount || 0}, matched=${result.matchedCount || 0}, modified=${result.modifiedCount || 0}`
  );
  return {
    insertedCount: result.upsertedCount || 0,
    matchedCount: result.matchedCount || 0,
    modifiedCount: result.modifiedCount || 0,
  };
};

const getCgmReadings = async (userId, filters = {}) => {
  await ensureActiveUser(userId);

  const query = { userId };
  if (filters.startTime) {
    query.timestamp = { ...query.timestamp, $gte: filters.startTime };
  }
  if (filters.endTime) {
    query.timestamp = { ...query.timestamp, $lte: filters.endTime };
  }

  const cursor = CgmReading.find(query).sort({ timestamp: 1 });
  if (filters.limit) {
    cursor.limit(filters.limit);
  }

  return cursor.exec();
};

const buildGlucoseEvent = (entry) => {
  const value = entry.glucoseValue;
  let type = 'stable';
  let title = 'Glucose reading';
  let description = 'Your glucose is within expected range.';

  if (value <= 70) {
    type = 'hypoglycemic';
    title = 'Low glucose alert';
    description = `Your glucose dropped to ${value} mg/dL. Consider a fast-acting snack.`;
  } else if (value >= 180) {
    type = 'hyperglycemic';
    title = 'High glucose alert';
    description = `Your glucose spiked to ${value} mg/dL. Monitor for insulin or dietary adjustments.`;
  } else if (entry.trend === 'rising') {
    type = 'rising';
    title = 'Glucose rising';
    description = `Your glucose is trending upward at ${value} mg/dL.`;
  } else if (entry.trend === 'falling') {
    type = 'falling';
    title = 'Glucose falling';
    description = `Your glucose is trending downward at ${value} mg/dL.`;
  } else {
    type = 'controlled';
    title = 'Glucose stable';
    description = `Your glucose is stable around ${value} mg/dL.`;
  }

  return {
    id: entry._id.toString(),
    type,
    title,
    description,
    glucoseValue: value,
    timestamp: entry.timestamp.toISOString(),
    detailedInfo: entry.metadata?.note || null,
  };
};

const getCgmEvents = async (userId, filters = {}) => {
  const readings = await getCgmReadings(userId, filters);
  if (!readings.length) {
    return [];
  }

  return readings
    .slice(-10)
    .reverse()
    .map(buildGlucoseEvent);
};

module.exports = {
  saveCgmReadings,
  getCgmReadings,
  getCgmEvents,
};
