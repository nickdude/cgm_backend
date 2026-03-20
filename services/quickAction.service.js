const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const DietEntry = require('../models/dietEntry.model');
const InsulinEntry = require('../models/insulinEntry.model');
const MedicineEntry = require('../models/medicineEntry.model');
const ExerciseEntry = require('../models/exerciseEntry.model');
const FingerBloodEntry = require('../models/fingerBloodEntry.model');

const ensureActiveUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

const saveDietEntry = async (userId, data) => {
  await ensureActiveUser(userId);
  const entry = await DietEntry.create({ userId, ...data });
  return entry;
};

const saveInsulinEntry = async (userId, data) => {
  await ensureActiveUser(userId);
  const entry = await InsulinEntry.create({ userId, ...data });
  return entry;
};

const saveMedicineEntry = async (userId, data) => {
  await ensureActiveUser(userId);
  const entry = await MedicineEntry.create({ userId, ...data });
  return entry;
};

const saveExerciseEntry = async (userId, data) => {
  await ensureActiveUser(userId);
  const entry = await ExerciseEntry.create({ userId, ...data });
  return entry;
};

const saveFingerBloodEntry = async (userId, data) => {
  await ensureActiveUser(userId);
  const entry = await FingerBloodEntry.create({ userId, ...data });
  return entry;
};

module.exports = {
  saveDietEntry,
  saveInsulinEntry,
  saveMedicineEntry,
  saveExerciseEntry,
  saveFingerBloodEntry,
};
