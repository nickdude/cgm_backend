const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    otp: {
      code: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 },
    },
    socialAuth: {
      appleId: { type: String, unique: true, sparse: true },
      googleId: { type: String, unique: true, sparse: true },
      facebookId: { type: String, unique: true, sparse: true },
    },
    tokens: [
      {
        accessToken: String,
        refreshToken: String,
        issuedAt: { type: Date, default: Date.now },
        expiresAt: Date,
      },
    ],
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
