const express = require("express");
const router = express.Router();
const participationController = require("../Controllers/participationController");
const { authenticateToken } = require("../Middleware/auth");

// Routes
//Submit Exam: api/view-participation
router.post("/", authenticateToken, participationController.fetchExam); // Fetch all


module.exports = router;
