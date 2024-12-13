const express = require("express");
const router = express.Router();
const inviteController = require("../Controllers/inviteController");
const { authenticateToken } = require("../Middleware/auth");

// Routes

router.post("/", authenticateToken, inviteController.inviteAndProvideAccess); // Fetch all

module.exports = router;
