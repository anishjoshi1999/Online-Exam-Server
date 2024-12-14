const User = require("../Models/User");
const Exam = require("../Models/Exam");
const { sendInviteViaEmail } = require("../utils/email");
function processEmailList(emailList) {
  const validEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Filter out invalid emails
  const validEmails = emailList.filter((email) =>
    validEmailPattern.test(email)
  );

  // Remove duplicates
  const uniqueValidEmails = [...new Set(validEmails)];

  return uniqueValidEmails;
}
async function getUserIdsByEmails(emailList) {
  try {
    // Fetch users whose email is in the provided email list
    const users = await User.find(
      { email: { $in: emailList } }, // Filter by the list of emails
      "_id" // Project only the `_id` field
    ).lean();
    // console.log(users)
    // Extract and return only the `_id` values
    const userIds = users.map((user) => user._id);
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

    const filteredEmail = processEmailList(emails);
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
};
