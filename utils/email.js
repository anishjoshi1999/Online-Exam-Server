require("dotenv").config();

const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const DOMAIN = process.env.MAILGUN_DOMAIN || "invite.starttest.online";
const API_KEY = process.env.MAILGUN_API_KEY;

if (!DOMAIN || !API_KEY) {
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
       <div style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #2C3E50; margin: 0; font-size: 24px;">Welcome to Start Test</h2>
        </div>
        
        <div style="color: #444; line-height: 1.6;">
            <p style="margin-top: 0;">Dear User,</p>
            
            <p>Thank you for creating an account with Start Test. To ensure the security of your account and activate all features, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3498DB; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; transition: background-color 0.3s ease;">
                    Verify Email Address
                </a>
            </div>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #3498DB; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;">
                    <strong>Security Notice:</strong> If you didn't create an account with Start Test, you can safely ignore this email. Your email address will not be activated without verification.
                </p>
            </div>
            
            <p>After verification, you'll have full access to our examination platform and can begin taking tests.</p>
            
            <p>If you have any questions or need assistance, our support team is here to help.</p>
            
            <p>Best regards,<br>The Start Test Team</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
        
        <div style="text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">Start Test</p>
            <p style="margin: 5px 0 0 0;">Your Trusted Examination Platform</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">This is an automated message, please do not reply.</p>
        </div>
    </div>
</div>
      `,
    });
    return response;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

const sendAccountCreationConfirmationEmail = async (email) => {
  try {
    const response = await mg.messages.create(DOMAIN, {
      from: `Start Test Support <mailgun@${DOMAIN}>`,
      to: email,
      subject: "Your Account Has Been Successfully Created",
      html: `
       <div style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                  <h2 style="color: #2C3E50; margin: 0; font-size: 24px;">Welcome to Start Test</h2>
              </div>
              
              <div style="color: #444; line-height: 1.6;">
                  <p style="margin-top: 0;">Dear User,</p>
                  
                  <p>Your account has been successfully created from the waiting list! To log in, use the email address you provided while filling out the waiting list.</p>
                  
                  <p>If you forget your password, you can reset it anytime by using the "Forgot Password" option on our login page. Follow the steps to set a new password and enjoy exploring our platform!</p>
                  
                  <p>Once you're ready, you can start taking tests online with ease.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${loginUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3498DB; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; transition: background-color 0.3s ease;">
                          Log In Now
                      </a>
                  </div>
                  
                  <p>If you have any questions or need assistance, feel free to contact our support team.</p>
                  
                  <p>Best regards,<br>The Start Test Team</p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
              
              <div style="text-align: center; color: #666; font-size: 14px;">
                  <p style="margin: 0;">Start Test</p>
                  <p style="margin: 5px 0 0 0;">Your Trusted Examination Platform</p>
                  <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">This is an automated message, please do not reply.</p>
              </div>
          </div>
      </div>
      `,
    });
    return response;
  } catch (error) {
    console.error("Error sending confirmation email:", error);
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
      <div style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #2C3E50; margin: 0; font-size: 24px;">Exam Invitation</h2>
        </div>
        
        <div style="color: #444; line-height: 1.6;">
            <p style="margin-top: 0;">Dear Candidate,</p>
            
            <p>You have been invited to take an exam on Start Test. Below you'll find your Exam access code:</p>
            
            <div style="text-align: center; margin: 25px 0;">
                <div style="display: inline-block; padding: 15px 30px; background-color: #3498DB; color: white; font-size: 22px; font-weight: bold; border-radius: 6px; letter-spacing: 1px;">
                    ${code}
                </div>
            </div>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #3498DB; padding: 15px; margin: 20px 0;">
                <strong style="display: block; margin-bottom: 10px;">Instructions:</strong>
                <ol style="margin: 0; padding-left: 20px;">
                    <li>Visit <a href="https://starttest.online" style="color: #3498DB; text-decoration: none; font-weight: 500;">starttest.online</a></li>
                    <li>Log in or sign up on StartTest.online using this email</li>
                    <li>Navigate to "Start Test"</li>
                    <li>Enter your access code</li>
                    <li>Begin your exam</li>
                </ol>
            </div>
            
            <p>If you experience any technical difficulties, please contact our support team for immediate assistance.</p>
            
            <p>Best of luck with your exam!</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
        
        <div style="text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">Start Test</p>
            <p style="margin: 5px 0 0 0;">Your Trusted Examination Platform</p>
        </div>
    </div>
</div>
      `,
    });
    return response;
  } catch (error) {
    console.error("Error sending invitation email:", error);
    throw error;
  }
};

const sendNotification = async (information) => {
  try {
    const response = await mg.messages.create(DOMAIN, {
      from: `Waiting List Update <mailgun@${DOMAIN}>`,
      to: `anishjoshi1999@gmail.com`,
      subject: "Waiting List Update: Someone filled the form",
      html: `
      <div style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #2C3E50; margin: 0; font-size: 24px;">Exam Slot Notification</h2>
          </div>
          
          <div style="color: #444; line-height: 1.6;">
            <p style="margin-top: 0;">Dear Candidate,</p>
            
            <p>We are notifying you that someone has filled the waiting list slot for your product. Below are your details for reference:</p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #3498DB; padding: 15px; margin: 20px 0;">
              <strong style="display: block; margin-bottom: 10px;">User Details:</strong>
              <p><strong>Email:</strong> ${information.email}</p>
              <p><strong>Full Name:</strong> ${information.fullName}</p>
              <p><strong>Profession:</strong> ${information.profession}</p>
              <p><strong>Education:</strong> ${information.education}</p>
              <p><strong>Location:</strong> ${information.location}</p>
              <p><strong>Receive Updates:</strong> ${information.receiveUpdates ? "Yes" : "No"}</p>
            </div>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">Start Test</p>
            <p style="margin: 5px 0 0 0;">Your Trusted Examination Platform</p>
          </div>
        </div>
      </div>
      `,
    });
    return response;
  } catch (error) {
    console.error("Error sending waiting list notification email:", error);
    throw error;
  }
};


const sendPasswordResetEmail = async (email, token) => {
  try {
    const response = await mg.messages.create(DOMAIN, {
      from: `Reset Password <mailgun@${DOMAIN}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
   <div style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #2C3E50; margin: 0; font-size: 24px;">Password Reset Request</h2>
        </div>
        
        <div style="color: #444; line-height: 1.6;">
            <p style="margin-top: 0;">Dear User,</p>
            
            <p>We received a request to reset the password for your Start Test account. To reset your password, please use the following reset code:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #f8f9fa; border: 2px dashed #3498DB; padding: 15px; display: inline-block; border-radius: 6px;">
                    <code style="font-size: 20px; color: #2C3E50; font-weight: bold; letter-spacing: 2px;">${token}</code>
                </div>
                <p style="margin-top: 10px; font-size: 14px; color: #666;">Visit https://starttest.online/forgot-password to reset your password</p>
            </div>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #e74c3c; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;">
                    <strong>Important Security Information:</strong>
                </p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>This reset code will expire in 1 hour</li>
                    <li>If you didn't request this password reset, please ignore this email</li>
                    <li>For security reasons, never share this code with anyone</li>
                </ul>
            </div>
            
            <p>After resetting your password, you'll be able to log in to your account with your new credentials.</p>
            
            <p>If you need any assistance or have security concerns, please contact our support team immediately.</p>
            
            <p>Best regards,<br>The Start Test Security Team</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
        
        <div style="text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">Start Test</p>
            <p style="margin: 5px 0 0 0;">Your Trusted Examination Platform</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">This is an automated security message, please do not reply.</p>
        </div>
    </div>
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
const sendInviteViaEmailForAdminAccess = async (emailList) => {
  try {
    const response = await mg.messages.create(DOMAIN, {
      from: `Admin Access Granted <mailgun@${DOMAIN}>`,
      to: [...emailList],
      subject: "You Have Been Granted Admin Access to Conduct Online MCQ Exams",
      html: `
      <div style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #2C3E50; margin: 0; font-size: 24px;">Admin Access Granted</h2>
        </div>
        
        <div style="color: #444; line-height: 1.6;">
            <p style="margin-top: 0;">Dear Admin,</p>
            
            <p>You have been granted <strong>admin access</strong> to conduct online MCQ exams for your students on <strong>Start Test</strong>. Simply log in to your account to get started.</p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #3498DB; padding: 15px; margin: 20px 0;">
                <strong style="display: block; margin-bottom: 10px;">Instructions:</strong>
                <ol style="margin: 0; padding-left: 20px;">
                    <li>Visit <a href="https://starttest.online" style="color: #3498DB; text-decoration: none; font-weight: 500;">starttest.online</a></li>
                    <li>Log in to your account using this email address</li>
                    <li>Start creating and managing exams for your students</li>
                </ol>
            </div>

            <div style="text-align: center; margin: 25px 0;">
                <p>Need help conducting an MCQ test? Watch this video tutorial:</p>
                <a href="https://www.youtube.com/watch?v=1fIdpTr6qP4" style="display: inline-block; padding: 12px 24px; background-color: #3498DB; color: white; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px;">
                    Watch Tutorial
                </a>
            </div>
            
            <p>If you experience any technical difficulties or have trouble conducting an online MCQ test, please contact the creator of Start Test for assistance:</p>
            <p style="text-align: center; margin: 20px 0;">
                <a href="mailto:anishjoshi1999@gmail.com" style="color: #3498DB; text-decoration: none; font-weight: 500;">anishjoshi1999@gmail.com</a>
            </p>
            
            <p>Thank you for using Start Test!</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
        
        <div style="text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">Start Test</p>
            <p style="margin: 5px 0 0 0;">Your Trusted Examination Platform</p>
        </div>
    </div>
</div>
      `,
    });
    return response;
  } catch (error) {
    console.error("Error sending invitation email:", error);
    throw error;
  }
};
module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInviteViaEmail,
  sendAccountCreationConfirmationEmail,
  sendNotification,
  sendInviteViaEmailForAdminAccess
};
