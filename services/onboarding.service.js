const User = require('../models/user.model');
const Onboarding = require('../models/onboarding.model');
const ApiError = require('../utils/apiError');

const onboardingQuestions = [
  { key: 'weight', type: 'number' },
  { key: 'height', type: 'number' },
  { key: 'diabetesType', type: 'single_select' },
  { key: 'diagnosisDate', type: 'date' },
  { key: 'glucoseUnit', type: 'single_select' },
  { key: 'cgmSensor', type: 'single_select' },
  { key: 'hba1c', type: 'number' },
  { key: 'targetLow', type: 'number' },
  { key: 'targetHigh', type: 'number' },
  { key: 'medications', type: 'multi_select' },
  { key: 'comorbidities', type: 'multi_select' },
  { key: 'activityLevel', type: 'single_select' },
  { key: 'dietaryPattern', type: 'single_select' },
];

const getQuestions = async () => {
  return {
    totalQuestions: onboardingQuestions.length,
    questions: onboardingQuestions,
  };
};

const getAnswersByUserId = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new ApiError(404, 'User not found');
  }

  const onboarding = await Onboarding.findOne({ userId });

  return {
    onboardingComplete: Boolean(user.onboardingComplete),
    answers: onboarding
      ? {
          weight: onboarding.weight,
          height: onboarding.height,
          diabetesType: onboarding.diabetesType,
          diagnosisDate: onboarding.diagnosisDate,
          glucoseUnit: onboarding.glucoseUnit,
          cgmSensor: onboarding.cgmSensor,
          hba1c: onboarding.hba1c,
          targetLow: onboarding.targetLow,
          targetHigh: onboarding.targetHigh,
          medications: onboarding.medications,
          comorbidities: onboarding.comorbidities,
          activityLevel: onboarding.activityLevel,
          dietaryPattern: onboarding.dietaryPattern,
          progress: onboarding.progress,
        }
      : null,
  };
};

const saveAnswersByUserId = async (userId, onboardingData) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new ApiError(404, 'User not found');
  }

  const onboarding = await Onboarding.findOneAndUpdate(
    { userId },
    { $set: onboardingData, $setOnInsert: { userId } },
    { new: true, upsert: true }
  );

  user.onboardingComplete = true;

  await user.save();

  return {
    onboardingComplete: Boolean(user.onboardingComplete),
    answers: {
      weight: onboarding.weight,
      height: onboarding.height,
      diabetesType: onboarding.diabetesType,
      diagnosisDate: onboarding.diagnosisDate,
      glucoseUnit: onboarding.glucoseUnit,
      cgmSensor: onboarding.cgmSensor,
      hba1c: onboarding.hba1c,
      targetLow: onboarding.targetLow,
      targetHigh: onboarding.targetHigh,
      medications: onboarding.medications,
      comorbidities: onboarding.comorbidities,
      activityLevel: onboarding.activityLevel,
      dietaryPattern: onboarding.dietaryPattern,
      progress: onboarding.progress,
    },
  };
};

module.exports = {
  getQuestions,
  getAnswersByUserId,
  saveAnswersByUserId,
};
