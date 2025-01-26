const User = require("../Models/User");
const Participant = require("../Models/Participant");
const { sendInviteViaEmail } = require("../utils/email");
// Not using slug for now. Showing all participants across all exams.
const addParticipant = async (req, res) => {
  try {
    const { email, slug } = req.body;

    if (!email || !slug) {
      return res.status(400).json({ message: "Email and slug are required." });
    }

    const existingParticipant = await Participant.findOne({
      email,
      slug,
      createdBy: req.user.userId,
    });

    if (existingParticipant) {
      return res.status(400).json({ message: "Participant already exists." });
    }

    const participant = new Participant({
      email,
      slug,
      createdBy: req.user.userId,
    });
    await participant.save();
    return res
      .status(201)
      .json({ message: "Participant added successfully.", participant });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error during registration", error: error.message });
  }
};

const sendEmail = async (req, res) => {
  try {
    const { email, slug } = req.body;

    if (!email || !slug) {
      return res.status(400).json({ message: "Email is required." });
    }

    const participant = await Participant.findOne({
      email,
      slug,
      createdBy: req.user.userId,
    });
    if (!participant) {
      return res.status(404).json({ message: "Participant not found." });
    }

    // Simulate sending an email
    participant.invited = true;
    console.log(`Sending email to ${email}`);
    await sendInviteViaEmail([email], slug);
    await participant.save();

    res.status(200).json({ message: `Email sent to ${email}.` });
  } catch (error) {
    res.status(500).json({ message: "Error sending email.", error });
  }
};
// Remove a participant
const removeParticipant = async (req, res) => {
  try {
    const { email, slug } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const result = await Participant.findOneAndDelete({ email, slug });
    if (!result) {
      return res.status(404).json({ message: "Participant not found." });
    }

    res.status(200).json({ message: "Participant removed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error removing participant.", error });
  }
};
// Get all participants for a specific slug
const getParticipants = async (req, res) => {
  try {
    const { slug } = req.body;
    if (!slug) {
      return res.status(400).json({ message: "Slug is required." });
    }
    const participants = await Participant.find({
      slug,
      createdBy: req.user.userId,
    });
    res.status(200).json(participants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching participants.", error });
  }
};
module.exports = {
  addParticipant,
  sendEmail,
  removeParticipant,
  getParticipants,
};
