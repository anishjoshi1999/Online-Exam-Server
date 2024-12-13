const User = require("../Models/User");
const Exam = require("../Models/Exam");

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
    console.log(req.body);
    //Validate the incoming data structure
    if (!emails) {
      return res
        .status(400)
        .json({ success: false, message: "No Emails Provided" });
    }
    let creatorInfo = await User.findById(req.user.userId);

    if (creatorInfo.role != "admin") {
      return res
        .status(401)
        .json({ message: "You are not authorized to Create Exam" });
    }

    try {
      // Step 1: Filter the email list
      let filteredEmail = processEmailList(emails);
      // Step 2: Get the user IDs from the filtered email list
      let userIds = await getUserIdsByEmails(filteredEmail);

      // Step 3: Find the exam by `userId` and `slug`
      let exam = await Exam.findOne({ userId: req.user.userId, slug: slug });
      console.log(exam);

      if (!exam) {
        console.error("Exam not found!");
        return;
      }
      // Ensure `access` is an array
      if (!Array.isArray(exam.access)) {
        exam.access = []; // Initialize as an empty array if undefined
      }
      // Step 4: Update the `access` field with the `userIds`
      exam.access = [...new Set([...exam.access, ...userIds])]; // Ensure no duplicates
      await exam.save();
      console.log("Exam access updated successfully:");
      return res
        .status(201)
        .json({
          message: "Exam access updated successfully:",
          access: emails,
        });
    } catch (error) {
      console.error(error); // Improved error logging
      return res.status(400).json({ success: false, error: error.message });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during registration", error: error.message });
  }
};
module.exports = {
  inviteAndProvideAccess,
};
