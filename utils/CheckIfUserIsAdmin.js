const User = require("../Models/User");
const CheckIfUserIsAdmin = async (userId) => {
  try {
    const userInfo = await User.findById(userId);
    return userInfo?.role === "admin";
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
};
module.exports = { CheckIfUserIsAdmin };
