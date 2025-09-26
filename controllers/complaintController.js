const Complaint = require("../models/Complaint");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// User creates a complaint
const createComplaint = async (req, res) => {
  try {
    const { type, description, location, date } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Build full photo URL if provided
    const photoUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    const complaint = await Complaint.create({
      type,
      description,
      location,
      date,
      photo: photoUrl,
      createdBy: user._id
    });

    res.status(201).json({
      ...complaint._doc,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error("Create Complaint Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// User views their complaints
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin views all complaints
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("createdBy", "name email phone")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin marks complaint as Noted
const markAsNoted = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("createdBy", "name email");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = "Noted";
    await complaint.save();

    // Send email
    await sendEmail(
      complaint.createdBy.email,
      "Your Complaint Has Been Noted",
      `<p>Dear ${complaint.createdBy.name},</p>
       <p>Your complaint <b>${complaint.type}</b> at ${complaint.location} has been <b>Noted</b> by the admin.</p>`
    );

    res.json({ message: "Complaint marked as Noted", complaint });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin marks complaint as Solved
const markAsSolved = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("createdBy", "name email");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = "Solved";
    await complaint.save();

    // Send email
    await sendEmail(
      complaint.createdBy.email,
      "Your Complaint Has Been Solved",
      `<p>Dear ${complaint.createdBy.name},</p>
       <p>Your complaint <b>${complaint.type}</b> at ${complaint.location} has been <b>Solved</b> by the admin.</p>
       <p>Thank you for your patience.</p>`
    );

    res.json({ message: "Complaint marked as Solved", complaint });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  markAsNoted,
  markAsSolved
};
