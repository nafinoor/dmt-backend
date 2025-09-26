const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    fare: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["Mobile Banking", "Bank Card"], required: true },
    paymentDetails: { type: Object }, // store provider, account, card info, etc.
    ticketNumber: { type: String, unique: true, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
