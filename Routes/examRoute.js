const express = require("express");
const router = express.Router();
const examController = require("../Controllers/examController");
const { authenticateToken } = require("../Middleware/auth");

// Routes
//Submit Exam: api/take-exam
router.post("/", authenticateToken, examController.submitExam); // Fetch all
//Fetch Exam: api/take-exam/${slug}
router.get("/:slug", authenticateToken, examController.fetchExam); // Fetch all

module.exports = router;
