const express = require("express");
const router = express.Router();
const mcqController = require("../Controllers/mcqController");
const { authenticateToken } = require("../Middleware/auth");

// Routes
router.get("/", authenticateToken, mcqController.findAll); // Fetch all
router.post("/", authenticateToken, mcqController.createOne); // Create
router.get("/:slug", authenticateToken, mcqController.findOne); // Fetch one by slug
router.put("/:slug", authenticateToken, mcqController.findOneAndUpdate); // Update by slug
router.delete("/:slug", authenticateToken, mcqController.findOneAndDelete); // Delete by slug

module.exports = router;
