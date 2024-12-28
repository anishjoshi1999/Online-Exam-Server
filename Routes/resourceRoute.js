const express = require("express");
const router = express.Router();
const resourceController = require("../Controllers/resourceController");
const { authenticateToken } = require("../Middleware/auth");

// Routes
router.get("/get-all-subjects", authenticateToken, resourceController.fetchSubjects); // fetch all subjects by user
router.post("/", authenticateToken, resourceController.uploadOne); // Route for uploading resource

module.exports = router;
