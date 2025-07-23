const nodemailer = require("nodemailer");
const generateOtp = require("../utils/generateOtp");
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid Email" });
  }
  const otp = generateOtp();
  const otpCreatedAt = new Date();

  try {
    await userModel.findOneAndUpdate(
      { email },
      {
        otp,
        otpCreatedAt,
        isEmailVerified: false,
      },
      { upsert: true, new: true }
    );

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}`,
      });
      console.log("Email:", email);
      console.log("OTP:", otp);

      console.log("OTP email sent successfully");
    } catch (err) {
      console.error("Error sending email:", err);
    }

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp || otp.length !== 6) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user || !user.otp || !user.otpCreatedAt) {
      return res
        .status(400)
        .json({ error: "OTP not found or already verified" });
    }

    const isExpired = new Date() - user.otpCreatedAt > 10 * 60 * 1000;

    if (user.otp !== otp || isExpired) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpCreatedAt = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: role || "buyer",
    });
    res.status(201).json({
      message: "Registered successfully",
      role: user.role,
      id: user._id,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      token,
      role: user.role,
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.requestReset = async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();
  const resetUrl = `http:localhost:5173/reset-password/${token}`;
  await transporter.sendMail({
    to: email,
    subject: "Password Reset",
    text: `Reset your password: ${resetUrl}`,
  });
  res.json({ message: "Reset link sent to email" });
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const user = await userModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
