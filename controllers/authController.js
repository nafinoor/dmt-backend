const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const fs = require("fs");
const path = require("path");

// Signup
const signup = async (req, res) => {
  const { name, address, phone, email, nid, password, role } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      address,
      phone,
      email,
      nid,
      password: hashed,
      role: role || "user",
      profilePhoto: null
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
      token: generateToken(user._id.toString())
    });
  } catch (err) {
    console.error("Signup Error:", err);
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

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
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

    // ✅ Delete old photo if exists
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

    // ✅ Build full URL for new photo
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
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  updateProfilePhoto
};
