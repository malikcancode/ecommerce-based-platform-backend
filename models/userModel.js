const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
  },
  otpCreatedAt: {
    type: Date,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["admin", "seller", "buyer", "manager", "sales"],
    default: "buyer",
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

module.exports = mongoose.model("User", userSchema);
