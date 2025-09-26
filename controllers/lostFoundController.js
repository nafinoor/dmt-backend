const LostFound = require("../models/LostFound");
const User = require("../models/User");

// Create Lost/Found report (User only)
const createReport = async (req, res) => {
  try {
    const { type, description, location, date } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Build full photo URL if uploaded
    const photoUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    const report = await LostFound.create({
      type,
      description,
      location,
      date,
      photo: photoUrl,   // store full URL
      createdBy: user._id
    });

    res.status(201).json({
      ...report._doc,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error("Create Report Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get all approved reports (Public)
const getApprovedReports = async (req, res) => {
  try {
    const reports = await LostFound.find({ status: "Posted" })
      .populate("createdBy", "name email phone")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all reports (Admin only)
const getAllReports = async (req, res) => {
  try {
    const reports = await LostFound.find()
      .populate("createdBy", "name email phone")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Approve report (Admin posts it to notice board)
const approveReport = async (req, res) => {
  try {
    const report = await LostFound.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = "Posted";
    await report.save();

    res.json({ message: "Report approved and posted", report });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete report (Admin only)
const deleteReport = async (req, res) => {
  try {
    const report = await LostFound.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    res.json({ message: "Report deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createReport,
  getApprovedReports,
  getAllReports,
  approveReport,
  deleteReport
};
