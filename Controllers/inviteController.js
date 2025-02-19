const User = require("../Models/User");
const Participant = require("../Models/Participant");
const IsInvited = require("../Models/IsInvited");
const { sendInviteViaEmail } = require("../utils/email");
// Not using slug for now. Showing all participants across all exams.
const addParticipant = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email and slug are required." });
    }

    const existingParticipant = await Participant.findOne({
      email,
      createdBy: req.user.userId,
    });

    if (existingParticipant) {
      return res.status(400).json({ message: "Participant already exists." });
    }

    const participant = new Participant({
      email,
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

    // Validate request body
    if (!email || !slug) {
      return res.status(400).json({ message: "Email and slug are required." });
    }

    // Find the participant
    const participant = await Participant.findOne({
      email,
      createdBy: req.user.userId,
    });

    if (!participant) {
      return res.status(404).json({ message: "Participant not found." });
    }

    // Check if IsInvited document exists for the slug
    let invitation = await IsInvited.findOne({ slug,createdBy: req.user.userId });

    if (!invitation) {
      // If no document exists, create a new one with the email in accessList
      invitation = new IsInvited({
        slug,
        accessList: [{ email, IsInvited: true }],
        createdBy: req.user.userId,
      });
    } else {
      // If it exists, check if email is already invited
      const alreadyInvited = invitation.accessList.some(
        (entry) => (entry.email === email && entry.IsInvited)
      );

      if (alreadyInvited) {
        return res.status(400).json({
          message: `Email ${email} has already been invited you can share the exam code to the student`,
        });
      }

      // Add email to the accessList
      invitation.accessList.push({ email, IsInvited: true });
    }


    // participant.invited = true;
    console.log(`Sending email to ${email}`);
    // await sendInviteViaEmail([email], slug);
    await participant.save();
    await invitation.save();

    res.status(200).json({ message: `Email sent to ${email}.` });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email.", error });
  }
};

// Remove a participant
const removeParticipant = async (req, res) => {
  try {
    const { email,slug } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const result = await Participant.findOneAndDelete({
      email,
      createdBy: req.user.userId,
    });
    const result1 = await IsInvited.findOneAndUpdate(
      { slug, createdBy: req.user.userId },
      { $pull: { accessList: { email } } }, // Removes matching email object from accessList
      { new: true } // Returns the updated document
    );
    if (!result && !result1) {
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
