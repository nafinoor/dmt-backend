const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["Schedule Change", "Maintenance", "Safety Notice", "General Announcement", "Lost & Found"],
      required: true
    },
    content: { type: String, required: true },
    date: { type: Date, required: true },
    priority: { type: String, enum: ["Normal", "High", "Urgent"], default: "Normal" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);
