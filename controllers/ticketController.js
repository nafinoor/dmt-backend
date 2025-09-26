const Ticket = require("../models/Ticket");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// Create ticket (after payment validation)
const createTicket = async (req, res) => {
  try {
    const { from, to, fare, paymentMethod, paymentDetails } = req.body;

    if (!from || !to || !fare || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const ticketNumber = "DMR-" + Math.floor(Math.random() * 1000000);

    const ticket = await Ticket.create({
      user: req.user._id,
      from,
      to,
      fare,
      paymentMethod,
      paymentDetails,
      ticketNumber,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    });

    // 🔹 Get user details
    const user = await User.findById(req.user._id);

    // 🔹 Prepare email HTML
    const html = `
      <h2>Dhaka Metro Rail Ticket Confirmation</h2>
      <p>Dear ${user.name},</p>
      <p>Thank you for your purchase. Here are your ticket details:</p>
      <ul>
        <li><b>Ticket Number:</b> ${ticket.ticketNumber}</li>
        <li><b>From:</b> ${ticket.from}</li>
        <li><b>To:</b> ${ticket.to}</li>
        <li><b>Fare:</b> ${ticket.fare} Taka</li>
        <li><b>Date:</b> ${ticket.date}</li>
        <li><b>Time:</b> ${ticket.time}</li>
        <li><b>Payment Method:</b> ${ticket.paymentMethod}</li>
      </ul>
      <p>Have a safe journey with Dhaka Metro Rail 🚆</p>
    `;

    // 🔹 Send email
    await sendEmail(user.email, "Your Dhaka Metro Rail Ticket", html);

    res.status(201).json({ ticket, message: "Ticket purchased and email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get all tickets (Travel History)
const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single ticket by ID (Ticket View)
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete ticket (for Travel History UI)
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json({ message: "Ticket deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  deleteTicket
};
