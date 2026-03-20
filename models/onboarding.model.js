const mongoose = require('mongoose');

const onboardingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    weight: { type: Number, default: null },
    height: { type: Number, default: null },
    diabetesType: { type: String, default: null },
    diagnosisDate: { type: Date, default: null },
    glucoseUnit: { type: String, default: null },
    cgmSensor: { type: String, default: null },
    hba1c: { type: Number, default: null },
    targetLow: { type: Number, default: null },
    targetHigh: { type: Number, default: null },
    medications: { type: [String], default: [] },
    comorbidities: { type: [String], default: [] },
    activityLevel: { type: String, default: null },
    dietaryPattern: { type: String, default: null },
    progress: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Onboarding', onboardingSchema);
