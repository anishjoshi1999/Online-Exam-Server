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
      from: `Email Verification <mailgun@${DOMAIN}>`,
      to: email,
      subject: "Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="text-align: center; color: #007BFF;">Welcome to Start Test</h2>
          <p>Hello,</p>
          <p>Thank you for registering with Start Test. Please verify your email address by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify Email</a>
          </p>
          <p>If you did not sign up for Start Test, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="text-align: center; color: #888;">Start Test - Your trusted exam platform</p>
        </div>
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
    const response = await mg.messages.create(DOMAIN, {
      from: `Exam Invite and Exam Access <mailgun@${DOMAIN}>`,
      to: [...emailList],
      subject: "You are Invited and Authorized to Take an Exam",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="text-align: center; color: #007BFF;">Exam Invitation</h2>
          <p>Hello,</p>
          <p>You have been invited to take an exam on Start Test. Please use the code below to access the exam:</p>
          <div style="text-align: center; margin: 20px;">
            <span style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; font-size: 20px; font-weight: bold; border-radius: 5px;">${code}</span>
          </div>
          <p>Visit Start Test and enter the code in the "Take Exam" section to get started.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="text-align: center; color: #888;">Start Test - Your trusted exam platform</p>
        </div>
      `,
    });
    return response;
  } catch (error) {
    console.error("Error sending invitation email:", error);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, token) => {
  try {
    const resetUrl = `${process.env.BACKEND_SERVER_URL}api/auth/reset-password?token=${token}`;
    const response = await mg.messages.create(DOMAIN, {
      from: `Reset Password <mailgun@${DOMAIN}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="text-align: center; color: #007BFF;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You recently requested to reset your password. Click the button below to proceed:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px;">Reset Password</a>
          </p>
          <p>If you did not request this change, please ignore this email. This link will expire in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="text-align: center; color: #888;">Start Test - Your trusted exam platform</p>
        </div>
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