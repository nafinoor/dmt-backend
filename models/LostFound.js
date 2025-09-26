const mongoose = require("mongoose");

const lostFoundSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Lost", "Found"], required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    photo: { type: String }, // filename stored
    status: { type: String, enum: ["Pending", "Posted"], default: "Pending" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LostFound", lostFoundSchema);
