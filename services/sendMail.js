const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send an OTP email for either signup verification or password reset
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} purpose - 'signup' or 'reset'
 */
function sendOTPEmail(email, otp, purpose = "reset") {
  const isSignup = purpose === "signup";

  const subject = isSignup
    ? '🔐 Verify Your Email - SnipSnap'
    : '🔐 Reset Your Password - SnipSnap';

  const heading = isSignup
    ? '🔐 Email Verification for SnipSnap'
    : '🔐 SnipSnap Password Reset';

  const introMessage = isSignup
    ? 'Thanks for signing up! Please verify your email address using the OTP below:'
    : 'Here is your One-Time Password (OTP) to reset your SnipSnap account password:';

  const msg = {
    to: email,
    from: process.env.SENDGRID_SENDER,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4A90E2;">${heading}</h2>
        <p>Hello,</p>
        <p>${introMessage}</p>
        <h1 style="letter-spacing: 2px; background: #f0f0f0; padding: 10px 20px; display: inline-block; border-radius: 5px;">
          ${otp}
        </h1>
        <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
        <p style="margin-top: 30px;">If you did not request this, you can ignore this email.</p>
        <hr />
        <p style="font-size: 0.9rem;">Need help? Reach us at <a href="mailto:support@snipsnap.com">support@snipsnap.com</a></p>
        <p style="font-size: 0.8rem; color: #aaa;">© ${new Date().getFullYear()} 📝 SnipSnap. All rights reserved. Aman Show.</p>
      </div>
    `,
  };

  return sgMail.send(msg);
}

module.exports = { sendOTPEmail };
