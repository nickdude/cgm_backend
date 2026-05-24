const mongoose = require('mongoose');

const cgmReadingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sensorId: {
      type: String,
      default: null,
      trim: true,
    },
    deviceType: {
      type: String,
      default: null,
      trim: true,
    },
    source: {
      type: String,
      default: null,
      trim: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    glucoseValue: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: 'mg/dL',
      trim: true,
    },
    trend: {
      type: String,
      enum: ['rising', 'falling', 'steady', 'unknown'],
      default: 'unknown',
      trim: true,
    },
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

cgmReadingSchema.index({ userId: 1, timestamp: 1 });

module.exports = mongoose.model('CgmReading', cgmReadingSchema);
