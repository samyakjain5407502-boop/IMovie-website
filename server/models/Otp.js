const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // Automatically delete after 5 minutes (300 seconds)
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Otp', otpSchema);

