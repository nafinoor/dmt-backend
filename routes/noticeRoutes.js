const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice
} = require("../controllers/noticeController");

const router = express.Router();

// Public Routes
router.get("/", getNotices);          // All notices
router.get("/:id", getNoticeById);    // Single notice

// Admin Routes
router.post("/", protect, admin, createNotice);
router.put("/:id", protect, admin, updateNotice);
router.delete("/:id", protect, admin, deleteNotice);

module.exports = router;
