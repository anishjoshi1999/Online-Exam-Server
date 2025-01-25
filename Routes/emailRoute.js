const express = require("express");
const router = express.Router();
const accessController = require("../Controllers/accessController");
const { authenticateToken } = require("../Middleware/auth");

// Routes
router.get(
  "/",
  authenticateToken,
  accessController.sendEmailToUser
);


module.exports = router;
