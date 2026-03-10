const nodemailer = require('nodemailer');
const logger = require('./logger');

let transporter;

// Initialize email transporter based on config
function initializeEmailService() {
  const provider = process.env.EMAIL_PROVIDER || 'mailtrap'; // 'mailtrap' or 'smtp'

  if (provider === 'mailtrap') {
    transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT || 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  } else if (provider === 'smtp') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    logger.warn('Email service not configured. Emails will not be sent.');
  }
}

function getVerificationEmailHTML(verificationLink, organizationName) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background: white; padding: 30px; border-radius: 8px; }
        .header { text-align: center; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
        .content { color: #555; line-height: 1.6; margin: 20px 0; }
        .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
        .warning { color: #d9534f; font-size: 13px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Supplier Scorecard</h1>
        </div>
        <div class="content">
          <p>Hello ${organizationName},</p>
          <p>Thank you for registering with <strong>Supplier Scorecard</strong>. To complete your registration and unlock your isolated evaluation environment, please verify your email address by clicking the button below.</p>
          <p>This link will expire in <strong>24 hours</strong>.</p>
          <center>
            <a href="${verificationLink}" class="button">Verify Email Address</a>
          </center>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; font-size: 12px; background: #f9f9f9; padding: 10px; border-radius: 4px;">${verificationLink}</p>
          <p class="warning">⚠️ If you did not create this account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Supplier Scorecard. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendVerificationEmail(email, organizationName, verificationToken) {
  if (!transporter) {
    logger.warn(`Email service not initialized. Verification email not sent to ${email}`);
    return;
  }

  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify-email.html?token=${verificationToken}`;
  const htmlContent = getVerificationEmailHTML(verificationLink, organizationName);

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@supplier-scorecard.com',
      to: email,
      subject: 'Verify Your Email - Supplier Scorecard',
      html: htmlContent,
    });
    logger.info(`Verification email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send verification email to ${email}`, err);
    throw err;
  }
}

async function sendPasswordResetEmail(email, resetLink) {
  if (!transporter) {
    logger.warn(`Email service not initialized. Password reset email not sent to ${email}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@supplier-scorecard.com',
      to: email,
      subject: 'Reset Your Password - Supplier Scorecard',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password (valid for 1 hour):</p>
        <p><a href="${resetLink}">Reset Password</a></p>
      `,
    });
    logger.info(`Password reset email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send password reset email to ${email}`, err);
    throw err;
  }
}

module.exports = {
  initializeEmailService,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
