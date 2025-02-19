const express = require("express");
const router = express.Router();
const notifyController = require("../Controllers/notifyController");
const { authenticateToken } = require("../Middleware/auth");

// Routes
router.get("/", authenticateToken, notifyController.fetchNotification);

module.exports = router;
