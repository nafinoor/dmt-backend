const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Service Issue", "Staff Behavior", "Facility Problem", "Safety Concern", "Other"],
      required: true
    },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    photo: { type: String }, // optional uploaded image (full URL)
    status: { type: String, enum: ["Pending", "Noted", "Solved"], default: "Pending" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
