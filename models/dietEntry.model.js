const mongoose = require('mongoose');

const dietEntrySchema = new mongoose.Schema(
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
    dietType: {
      type: String,
      required: true,
      trim: true,
    },
    foodName: {
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

module.exports = mongoose.model('DietEntry', dietEntrySchema);
