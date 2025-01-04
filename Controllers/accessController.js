require("dotenv").config();
const User = require("../Models/User");
const WaitingUser = require("../Models/WaitingUser");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const {
  sendNotification,
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/email");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const getAllStudents = async (req, res) => {
  try {
    // Fetch users with role "user" created by the logged-in admin/teacher
    const users = await User.find({ role: "user", createdBy: req.user.userId });

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }

    res.json({
      success: true,
      message: "Users retrieved successfully",
      data: { users },
    });
  } catch (error) {
    console.error("Error retrieving users:", error.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving users",
      error: error.message,
    });
  }
};


const provideStudentAccess = async (req, res) => {
  try {
    const { studentEmail } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({
      email: studentEmail,
      createdBy: req.user.userId,
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    let password = uuidv4().replace(/-/g, "").slice(0, 9);
    // Create new user
    const user = new User({
      email: studentEmail,
      password: password,
      firstName: "alex",
      lastName: "john",
      verificationToken,
      verificationTokenExpiry,
      receiveUpdates: true,
      createdBy: req.user.userId,
    });
    await user.save();

    // Send verification email
    // await sendVerificationEmail(user.email, verificationToken);

    res.json({
      message:
        "User account Created for StartTest.Online added to the waiting list successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
};

module.exports = {
  getAllStudents,
  provideStudentAccess,
};
