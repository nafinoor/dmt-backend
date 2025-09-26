const express = require("express");
const multer = require("multer");
const { protect, admin, userOnly } = require("../middleware/authMiddleware");
const {
  createReport,
  getApprovedReports,
  getAllReports,
  approveReport,
  deleteReport
} = require("../controllers/lostFoundController");

const router = express.Router();

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Public
router.get("/", getApprovedReports); // Everyone sees approved ones

// User
router.post("/", protect, userOnly, upload.single("photo"), createReport);

// Admin
router.get("/all", protect, admin, getAllReports);
router.put("/:id/approve", protect, admin, approveReport);
router.delete("/:id", protect, admin, deleteReport);

module.exports = router;
