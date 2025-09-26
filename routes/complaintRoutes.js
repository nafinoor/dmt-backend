const express = require("express");
const multer = require("multer");
const { protect, admin, userOnly } = require("../middleware/authMiddleware");
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  markAsNoted,
  markAsSolved
} = require("../controllers/complaintController");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// User only
router.post("/", protect, userOnly, upload.single("photo"), createComplaint);
router.get("/my", protect, userOnly, getMyComplaints);

// Admin only
router.get("/all", protect, admin, getAllComplaints);
router.put("/:id/note", protect, admin, markAsNoted);
router.put("/:id/solve", protect, admin, markAsSolved);

module.exports = router;
