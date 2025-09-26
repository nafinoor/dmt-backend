const Notice = require("../models/Notice");

// Create Notice (Admin only)
const createNotice = async (req, res) => {
  try {
    const { title, category, content, date, priority } = req.body;

    const notice = await Notice.create({
      title,
      category,
      content,
      date,
      priority,
      createdBy: req.user._id
    });

    res.status(201).json(notice);
  } catch (err) {
    console.error("Create Notice Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Notices (for users)
const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Single Notice
const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Notice (Admin only)
const updateNotice = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    const { title, category, content, date, priority } = req.body;

    if (title) notice.title = title;
    if (category) notice.category = category;
    if (content) notice.content = content;
    if (date) notice.date = date;
    if (priority) notice.priority = priority;

    await notice.save();
    res.json(notice);
  } catch (err) {
    console.error("Update Notice Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Notice (Admin only)
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.json({ message: "Notice deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice
};
