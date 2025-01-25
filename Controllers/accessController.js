const User = require("../Models/User");
// const Participant = require("../Models/Participant");
const { sendInviteViaEmailForAdminAccess } = require("../utils/email");
let emailList = [
  "rohanprajapati1361@gmail.com",
  "mahendrapaudel21@gmail.com",
  "megatutors4neb@gmail.com",
//   "anishjoshi1999@gmail.com",
  "loriajoyce12@gmail.com",
];
// Get all participants for a specific slug
const sendEmailToUser = async (req, res) => {
  try {
    const users = await User.find({});
    let filteredEmails = users.map(e => e.email).filter(e => emailList.includes(e));
    console.log(filteredEmails);
    await sendInviteViaEmailForAdminAccess(filteredEmails)
    console.log("Email sent to users");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching participants.", error });
  }
};

module.exports = {
  sendEmailToUser,
};
