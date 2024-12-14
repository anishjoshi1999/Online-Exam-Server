require("dotenv").config();

const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const DOMAIN = process.env.MAILGUN_DOMAIN || "invite.starttest.online";
const API_KEY = process.env.MAILGUN_API_KEY;

if (!DOMAIN || !API_KEY ) {
  throw new Error("Missing required environment variables.");
}

const mg = mailgun.client({
  username: "api",
  key: API_KEY,
});

const sendVerificationEmail = async (email, token) => {
  try {
    const verificationUrl = `${process.env.BACKEND_SERVER_URL}/api/auth/verify-email?token=${token}`;
    const response = await mg.messages.create(DOMAIN, {
      from: `Exam Invite <mailgun@${DOMAIN}>`,
      to: email,
      subject: "Verify Your Email",
      html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });
    console.log(`Verification email sent to ${email}`);
    return response;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

const sendInviteViaEmail = async (emailList, code) => {
  try {
    // const verificationCode = code;
    const response = await mg.messages.create(DOMAIN, {
      from: `Exam Invite <mailgun@${DOMAIN}>`,
      to: [...emailList],
      subject: "You have been authorized and Invited for the exam",
      html: `
        <h1>You have invited to take the exam</h1>
        <p>Take the exam code and paste on take exam section of Start Test</p>

        <p>Here is your code: ${code}</p>
      `,
    });
    return response;
  } catch (error) {
    console.error("Error sending Invitation email:", error);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, token) => {
  try {
    const resetUrl = `${process.env.BACKEND_SERVER_URL}api/auth/reset-password?token=${token}`;
    const response = await mg.messages.create(DOMAIN, {
      from: `Exam Invite <mailgun@${DOMAIN}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <h1>Password Reset Request</h1>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
    console.log(`Password reset email sent to ${email}`);
    return response;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInviteViaEmail
};