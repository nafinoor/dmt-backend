const express = require("express");
const multer = require("multer");
const {
  signup,
  verifyEmail,
  resendVerification,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  updateProfilePhoto
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/verify/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/profile/photo", protect, upload.single("photo"), updateProfilePhoto);

module.exports = router;
