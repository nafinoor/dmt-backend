const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createTicket,
  getTickets,
  getTicketById,
  deleteTicket
} = require("../controllers/ticketController");

const router = express.Router();

router.post("/", protect, createTicket);        // Buy Ticket
router.get("/", protect, getTickets);           // Travel History
router.get("/:id", protect, getTicketById);     // View Ticket
router.delete("/:id", protect, deleteTicket);   // Delete Ticket

module.exports = router;
