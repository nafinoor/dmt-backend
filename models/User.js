const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    nid: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    profilePhoto: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,  // stores token
    verificationExpires: Date,   // expiry for token
    resetToken: String,
    resetTokenExpire: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
