require("dotenv").config();
const User = require("../Models/User");
const WaitingUser = require("../Models/WaitingUser");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/email");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, receiveUpdates } = req.body;
    console.log(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      verificationToken,
      verificationTokenExpiry,
      receiveUpdates,
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during registration", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update user's refresh token and last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findOne({ _id: decoded.userId, refreshToken });

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error refreshing token", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    // Clear refresh token in database
    await User.findOneAndUpdate(
      { refreshToken },
      { $set: { refreshToken: null } }
    );

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during logout", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a 6-character alphanumeric token
    const resetToken = uuidv4().replace(/-/g, "").slice(0, 6);
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ message: "Password reset instructions sent to your email" });
  } catch (error) {
    res.status(500).json({
      message: "Error processing password reset",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res
        .status(400)
        .json({ message: "Verification token is required" });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
      isVerified: false,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return res.redirect(`${process.env.CORS_ORIGIN}/login`);
  } catch (error) {
    res.status(500).json({
      message: "Error verifying email",
      error: error.message,
    });
  }
};
const waitingList = async (req, res) => {
  try {
    const { email, fullName, profession, education, location, receiveUpdates } =
      req.body;

    // Check if the email already exists in the waiting list
    const existingUser = await WaitingUser.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists in the waiting list" });
    }

    // Create a new waiting user
    const newWaitingUser = new WaitingUser({
      email,
      fullName,
      profession,
      education,
      location,
      receiveUpdates,
    });

    await newWaitingUser.save();

    res.json({ message: "User added to the waiting list successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error during adding to waiting list",
        error: error.message,
      });
  }
};
module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  waitingList,
};
