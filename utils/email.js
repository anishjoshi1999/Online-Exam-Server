const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email',
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};