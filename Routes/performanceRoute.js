const express = require("express");
const router = express.Router();
const performanceController = require("../Controllers/performanceController");
const { authenticateToken } = require("../Middleware/auth");

// Routes
//api/view-performance
//Fetch All Performance of a User with pagination: api/view-performance
router.get("/", authenticateToken, performanceController.fetchAll); // Fetch all
//find Specific performance of Specific exam
router.get("/:slug", authenticateToken, performanceController.findOneResult); // Fetch specific performance
//find Specific performance of Specific exam
// router.post("/", authenticateToken, performanceController.findOne); // Fetch specific performance

module.exports = router;
