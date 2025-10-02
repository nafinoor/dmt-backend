const express = require("express");
const { protect, userOnly } = require("../middleware/authMiddleware");
const {
  createTicket,
  getTickets,
  getTicketById,
  getlatestTicket,
  deleteTicket
} = require("../controllers/ticketController");

const router = express.Router();

router.post("/", protect, userOnly, createTicket);   // Buy Ticket
router.get("/", protect, userOnly, getTickets);     // Travel History
router.get("/latest", protect, userOnly, getlatestTicket); // View Latest Ticket
router.get("/:id", protect, userOnly, getTicketById);     // View Ticket
router.delete("/:id", protect, userOnly, deleteTicket);   // Delete Ticket

module.exports = router;
