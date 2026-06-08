const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send verification email
const sendVerificationEmail = async (email, name, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: `"FitnessPro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email Address - FitnessPro',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Email - FitnessPro</title>
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #f6f9fc; }
          .container { max-width: 560px; margin: 0 auto; padding: 20px; }
          .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e8ecf0; }
          .content { padding: 32px 40px; }
          .logo { text-align: center; margin-bottom: 24px; }
          .logo-text { font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; background-clip: text; color: transparent; }
          h1 { color: #1a2c3e; font-size: 24px; font-weight: 600; margin: 0 0 12px 0; text-align: center; }
          .greeting { color: #4a5568; font-size: 16px; line-height: 1.5; margin-bottom: 24px; text-align: center; }
          .button-container { text-align: center; margin: 32px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white !important; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 500; font-size: 15px; }
          .warning { background: #fef3c7; border-left: 3px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin: 24px 0; font-size: 13px; color: #92400e; }
          .code-box { background: #f7fafc; padding: 12px; border-radius: 8px; margin-top: 12px; word-break: break-all; font-size: 12px; color: #3b82f6; font-family: monospace; border: 1px solid #e2e8f0; }
          .divider { border-top: 1px solid #e8ecf0; margin: 24px 0 16px; }
          .footer-text { color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5; }
          .footer-links { text-align: center; margin-top: 12px; }
          .footer-links a { color: #94a3b8; text-decoration: none; font-size: 12px; margin: 0 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="content">
              <div class="logo">
                <span class="logo-text">FitnessPro</span>
              </div>
              
              <h1>Verify your email address</h1>
              
              <div class="greeting">
                Hello <strong>${name}</strong>,
              </div>
              
              <div class="greeting">
                Thanks for joining FitnessPro! Please verify your email address to get started with your fitness journey.
              </div>
              
              <div class="button-container">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <div class="warning">
                ⚠️ This verification link expires in <strong>24 hours</strong>.
              </div>
              
              <div style="font-size: 13px; color: #64748b; text-align: center;">
                Or copy and paste this link:
                <div class="code-box">
                  ${verificationUrl}
                </div>
              </div>
              
              <div class="divider"></div>
              
              <div class="footer-text">
                If you didn't create an account with FitnessPro, please ignore this email.
              </div>
              <div class="footer-links">
                <a href="#">Privacy Policy</a> • <a href="#">Terms of Service</a> • <a href="#">Support</a>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send welcome email after verification
const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"FitnessPro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to FitnessPro! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to FitnessPro</title>
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #f6f9fc; }
          .container { max-width: 560px; margin: 0 auto; padding: 20px; }
          .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e8ecf0; }
          .content { padding: 32px 40px; }
          .logo { text-align: center; margin-bottom: 24px; }
          .logo-text { font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; background-clip: text; color: transparent; }
          h1 { color: #1a2c3e; font-size: 24px; font-weight: 600; margin: 0 0 12px 0; text-align: center; }
          .greeting { color: #4a5568; font-size: 16px; line-height: 1.5; margin-bottom: 20px; text-align: center; }
          .feature-grid { display: flex; gap: 16px; margin: 32px 0; flex-wrap: wrap; justify-content: center; }
          .feature { flex: 1; text-align: center; padding: 16px; background: #f7fafc; border-radius: 12px; min-width: 100px; }
          .feature-icon { font-size: 28px; margin-bottom: 8px; display: block; }
          .feature-title { font-weight: 600; color: #1a2c3e; font-size: 14px; margin-bottom: 4px; }
          .feature-desc { font-size: 11px; color: #718096; }
          .button-container { text-align: center; margin: 32px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white !important; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 500; font-size: 15px; }
          .divider { border-top: 1px solid #e8ecf0; margin: 24px 0 16px; }
          .footer-text { color: #94a3b8; font-size: 12px; text-align: center; }
          .footer-links { text-align: center; margin-top: 12px; }
          .footer-links a { color: #94a3b8; text-decoration: none; font-size: 12px; margin: 0 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="content">
              <div class="logo">
                <span class="logo-text">FitnessPro</span>
              </div>
              
              <h1>Welcome to FitnessPro! 🎉</h1>
              
              <div class="greeting">
                Dear <strong>${name}</strong>,
              </div>
              
              <div class="greeting">
                Thank you for verifying your email! Your account is now fully activated. We're excited to have you on board.
              </div>
              
              <div class="feature-grid">
                <div class="feature">
                  <span class="feature-icon">📋</span>
                  <div class="feature-title">Complete Profile</div>
                  <div class="feature-desc">Add your details & goals</div>
                </div>
                <div class="feature">
                  <span class="feature-icon">🎯</span>
                  <div class="feature-title">Set Goals</div>
                  <div class="feature-desc">Define your fitness targets</div>
                </div>
                <div class="feature">
                  <span class="feature-icon">💪</span>
                  <div class="feature-title">Start Training</div>
                  <div class="feature-desc">Get personalized plans</div>
                </div>
              </div>
            
              <div class="button-container">
                <a href="${process.env.FRONTEND_URL}/login" class="button">Get Started Now</a>
              </div>
              
              <div class="divider"></div>
              
              <div class="footer-text">
                Have questions? Contact our support team anytime.
              </div>
              <div class="footer-links">
                <a href="#">Help Center</a> • <a href="#">Community</a> • <a href="#">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"FitnessPro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - FitnessPro',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - FitnessPro</title>
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #f6f9fc; }
          .container { max-width: 560px; margin: 0 auto; padding: 20px; }
          .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e8ecf0; }
          .content { padding: 32px 40px; }
          .logo { text-align: center; margin-bottom: 24px; }
          .logo-text { font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; background-clip: text; color: transparent; }
          h1 { color: #1a2c3e; font-size: 24px; font-weight: 600; margin: 0 0 12px 0; text-align: center; }
          .greeting { color: #4a5568; font-size: 16px; line-height: 1.5; margin-bottom: 20px; text-align: center; }
          .button-container { text-align: center; margin: 32px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white !important; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 500; font-size: 15px; }
          .warning { background: #fef3c7; border-left: 3px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin: 24px 0; font-size: 13px; color: #92400e; }
          .code-box { background: #f7fafc; padding: 12px; border-radius: 8px; margin-top: 12px; word-break: break-all; font-size: 12px; color: #3b82f6; font-family: monospace; border: 1px solid #e2e8f0; }
          .divider { border-top: 1px solid #e8ecf0; margin: 24px 0 16px; }
          .footer-text { color: #94a3b8; font-size: 12px; text-align: center; }
          .footer-links { text-align: center; margin-top: 12px; }
          .footer-links a { color: #94a3b8; text-decoration: none; font-size: 12px; margin: 0 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="content">
              <div class="logo">
                <span class="logo-text">FitnessPro</span>
              </div>
              
              <h1>Reset Your Password</h1>
              
              <div class="greeting">
                Hello <strong>${name}</strong>,
              </div>
              
              <div class="greeting">
                We received a request to reset your password. Click the button below to create a new password.
              </div>
              
              <div class="button-container">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <div class="warning">
                🔒 This link expires in <strong>1 hour</strong> for security reasons.
              </div>
              
              <div style="font-size: 13px; color: #64748b; text-align: center;">
                If you didn't request this, please ignore this email.
              </div>
              
              <div class="code-box">
                ${resetUrl}
              </div>
              
              <div class="divider"></div>
              
              <div class="footer-text">
                © 2026 FitnessPro. All rights reserved.
              </div>
              <div class="footer-links">
                <a href="#">Privacy Policy</a> • <a href="#">Terms of Service</a> • <a href="#">Support</a>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};