const express = require("express");
const router = express.Router();
const participationController = require("../Controllers/participationController");
const { authenticateToken } = require("../Middleware/auth");

// Routes
//Submit Exam: api/view-participation
router.post("/", authenticateToken, participationController.fetchResult); // Fetch all
router.get("/:slug", authenticateToken, participationController.fetch); // Fetch all


module.exports = router;
