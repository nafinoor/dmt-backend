const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const fs = require("fs");
const path = require("path");


// Signup with email verification
const signup = async (req, res) => {
  try {
    const { name, address, phone, email, nid, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    // Create verification token
    const token = crypto.randomBytes(32).toString("hex");
    const verificationUrl = `${req.protocol}://${req.get("host")}/api/auth/verify/${token}`;

    const user = await User.create({
      name,
      address,
      email,
      password: hashed,
      phone,
      nid,
      role: role || "user",
      profilePhoto: null,
      isVerified: false,
      verificationToken: token,
      verificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24h expiry
    });

    // Send email
    await sendEmail(
      user.email,
      "Verify Your Email - Dhaka Metro Rail",
      `<p>Hello ${user.name},</p>
       <p>Please verify your email by clicking below:</p>
       <a href="${verificationUrl}">Verify Email</a>
       <p>This link expires in 24 hours.</p>`
    );

    res.status(201).json({ message: "Signup successful. Please check your email to verify your account." });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Email Verification
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/login?verified=1`);
  } catch (err) {
    console.error("Verify Email Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Resend Email
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    const token = crypto.randomBytes(32).toString("hex");
    const verificationUrl = `${req.protocol}://${req.get("host")}/api/auth/verify/${token}`;

    user.verificationToken = token;
    user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendEmail(
      user.email,
      "Resend Verification - Dhaka Metro Rail",
      `<p>Hello ${user.name},</p>
       <p>Please verify your email by clicking below:</p>
       <a href="${verificationUrl}">Verify Email</a>`
    );

    res.json({ message: "Verification email resent" });
  } catch (err) {
    console.error("Resend Verification Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto
        ? `${req.protocol}://${req.get("host")}/uploads/${user.profilePhoto}`
        : null,
      token: generateToken(user._id.toString())
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset_password.html?token=${resetToken}`;
    await sendEmail(user.email, "Password Reset", `<a href="${resetUrl}">Reset Password</a>`);

    res.json({ message: "Reset link sent to email" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: new Date() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    address: req.user.address,
    phone: req.user.phone,
    nid: req.user.nid,
    role: req.user.role,
    profilePhoto: req.user.profilePhoto
      ? `${req.protocol}://${req.get("host")}/uploads/${req.user.profilePhoto}`
      : null
  });
};

// Update Profile (without photo)
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, address, phone, nid, password } = req.body;

    if (name) user.name = name;
    if (address) user.address = address;
    if (phone) user.phone = phone;
    if (nid) user.nid = nid;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Profile Photo
const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No photo uploaded" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete old photo if exists
    if (user.profilePhoto) {
      try {
        // extract filename from stored URL (if full URL was stored)
        const oldFile = user.profilePhoto.split("/uploads/")[1];
        if (oldFile) {
          const oldPath = path.join(__dirname, "..", "uploads", oldFile);
          fs.unlink(oldPath, (err) => {
            if (err) {
              console.warn("Old photo not deleted (maybe already missing):", err.message);
            }
          });
        }
      } catch (err) {
        console.warn("Error handling old photo delete:", err.message);
      }
    }

    // Build full URL for new photo
    const photoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    // Save new photo URL to DB
    user.profilePhoto = photoUrl;
    await user.save();

    res.json({
      message: "Profile photo updated",
      photoUrl
    });
  } catch (err) {
    console.error("Photo Upload Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  signup,
  verifyEmail,
  resendVerification,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  updateProfilePhoto
};
