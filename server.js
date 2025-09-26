const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const lostFoundRoutes = require("./routes/lostFoundRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// serve static uploads
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/lostfound", lostFoundRoutes);
app.use("/api/complaints", complaintRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
