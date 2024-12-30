const User = require("../Models/User");
const Exam = require("../Models/Exam");
const { sendInviteViaEmail } = require("../utils/email");
const { isEmail, normalizeEmail } = require("validator");
const { v4: uuidv4 } = require("uuid");
const {
  uniqueNamesGenerator,
  names,
  starWars,
} = require("unique-names-generator");

function processEmailList(emailList) {
  // Filter out invalid emails and normalize valid ones
  const validNormalizedEmails = emailList
    .filter((email) => isEmail(email)) // Validate email
    .map((email) => normalizeEmail(email)); // Normalize email

  // Remove duplicates
  const uniqueValidEmails = [...new Set(validNormalizedEmails)];

  return uniqueValidEmails;
}

async function getUserIdsByEmails(emailList) {
  try {
    // Fetch users whose email is in the provided email list
    const users = await User.find(
      { email: { $in: emailList } }, // Filter by the list of emails
      "_id" // Project only the `_id` field
    ).lean();
    console.log(users);
    // Extract and return only the `_id` values
    const userIds = users.map((user) => user._id); // Corrected: No braces or explicit return
    return userIds;
  } catch (error) {
    console.error("Error fetching user IDs:", error);
    throw error;
  }
}
const inviteAndProvideAccess = async (req, res) => {
  try {
    let { emails, slug } = req.body;

    if (!emails) {
      return res
        .status(400)
        .json({ success: false, message: "No Emails Provided" });
    }

    const creatorInfo = await User.findById(req.user.userId);

    if (creatorInfo.role !== "admin") {
      return res
        .status(401)
        .json({ message: "You are not authorized to Create Exam" });
    }
    // Filter out invalid emails and normalize valid ones
    const filteredEmail = processEmailList(emails);
    if (filteredEmail.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid emails provided" });
    }
    const exam = await Exam.findOne({ userId: req.user.userId, slug });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found!" });
    }
    // Filter out emails that already exist in the access list
    const newEmails = filteredEmail.filter(
      (email) => !exam.access.includes(email)
    );
    if (newEmails.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "All provided emails already have access to this exam",
        });
    }

    // Update the access field directly without triggering `pre('save')`
    await Exam.findByIdAndUpdate(
      exam._id,
      { $addToSet: { access: { $each: newEmails } } },
      { new: true }
    );

    try {
      await sendInviteViaEmail(filteredEmail, slug);
    } catch (error) {
      return res.status(401).json({
        message: "Exam access is provided but failed to send email",
        access: emails,
      });
    }

    return res.status(201).json({
      message: "Exam access updated successfully",
      access: emails,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error during registration", error: error.message });
  }
};

const createAndProvideAccess = async (req, res) => {
  try {
    let { emails, slug } = req.body;

    if (!emails) {
      return res
        .status(400)
        .json({ success: false, message: "No Emails Provided" });
    }

    const creatorInfo = await User.findById(req.user.userId);

    if (creatorInfo.role !== "admin") {
      return res
        .status(401)
        .json({ message: "You are not authorized to Create Exam" });
    }

    const filteredEmail = processEmailList(emails);
    // create an account for the user if not exist
    for (let email of filteredEmail) {
      const user = await User.findOne({ email }).lean();
      if (!user) {
        // Generate a 6-character alphanumeric token
        let password = uuidv4().replace(/-/g, "").slice(0, 9);
        // Generate a first name
        let firstName = uniqueNamesGenerator({
          dictionaries: [names], // Use the built-in 'names' dictionary
          length: 1, // Generate a single word
        });

        // Generate a last name
        let lastName = uniqueNamesGenerator({
          dictionaries: [starWars], // Use another dictionary for variety, e.g., 'starWars'
          length: 1, // Generate a single word
        });
        const newUser = new User({
          email,
          password,
          firstName,
          lastName,
          isVerified: false,
          role: "user",
          receiveUpdates: true,
        });
        await newUser.save();
      }
    }

    const userIds = await getUserIdsByEmails(filteredEmail);
    const exam = await Exam.findOne({ userId: req.user.userId, slug });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found!" });
    }

    const updatedAccess = [...new Set([...exam.access, ...userIds])];

    // Update the access field directly without triggering `pre('save')`
    await Exam.findByIdAndUpdate(
      exam._id,
      { $set: { access: updatedAccess } },
      { new: true }
    );
    try {
      await sendInviteViaEmail(filteredEmail, slug);
    } catch (error) {
      return res.status(401).json({
        message: "Exam access is provided but failed to send email",
        access: emails,
      });
    }

    return res.status(201).json({
      message: "Exam access updated successfully",
      access: emails,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error during registration", error: error.message });
  }
};

module.exports = {
  inviteAndProvideAccess,
  createAndProvideAccess,
};
