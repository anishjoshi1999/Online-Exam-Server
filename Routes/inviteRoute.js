const express = require("express");
const router = express.Router();
const inviteController = require("../Controllers/inviteController");
const { authenticateToken } = require("../Middleware/auth");

// Routes
router.post(
  "/get-all-participants-for-a-specific-slug",
  authenticateToken,
  inviteController.getParticipants
);

router.delete(
  "/remove-participant",
  authenticateToken,
  inviteController.removeParticipant
);
router.post(
  "/add-participant",
  authenticateToken,
  inviteController.addParticipant
);
router.post(
  "/sent-invite-to-a-participant",
  authenticateToken,
  inviteController.sendEmail
);
module.exports = router;
