const mongoose = require('mongoose');

const insulinEntrySchema = new mongoose.Schema(
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
    insulinName: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InsulinEntry', insulinEntrySchema);
