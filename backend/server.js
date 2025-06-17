require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const cron = require("node-cron");

const studentRoutes = require("./routes/studentRoutes");
const codeforcesRoutes = require("./routes/codeforcesRoutes");
const cronService = require("./services/cronService");
const configRoutes = require("./routes/configRoutes");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP which may block requests
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin requests
  })
);
app.use(compression());

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/student-progress-db"
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/codeforces", codeforcesRoutes);
app.use("/api/config", configRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Initialize cron jobs
cronService.initializeCronJobs();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
