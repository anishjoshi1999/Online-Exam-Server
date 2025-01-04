require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const connectDB = require("./config/database");
const authRoutes = require("./Routes/authRoute");
const accessRoutes = require("./Routes/accessRoute");
const mcqRoutes = require("./Routes/mcqRoute");
const examRoutes = require("./Routes/examRoute");
const performanceRoutes = require("./Routes/performanceRoute");
const participationRoutes = require("./Routes/participationRoute");
const inviteRoutes = require("./Routes/inviteRoute");
const resourceRoutes = require("./Routes/resourceRoute");
const logger = require("./config/logger"); // Import the logger
const app = express();

// Connect to MongoDB
connectDB();

// Rate limiter
const rateLimiter = new RateLimiterMemory({
  points: 10, // Number of points
  duration: 1, // Per second
});
// Log incoming requests
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`); // Log method and URL
  next();
});
// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ message: "Too many requests" });
  }
});
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Take Exam Server" });
});
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/mcq", mcqRoutes);
app.use("/api/take-exam", examRoutes);
app.use("/api/view-performance", performanceRoutes);
app.use("/api/view-participation", participationRoutes);
app.use("/api/invite-participant", inviteRoutes);
app.use("/api/upload-resources", resourceRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
