const mongoose = require('mongoose');

const fingerBloodEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actionTime: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    bgmValue: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      default: 'mmol/L',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FingerBloodEntry', fingerBloodEntrySchema);
