// backend/controllers/contact.controller.js
const Contact = require('../models/contact.model');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const nodemailer = require('nodemailer');

// Email transporter (will be configured based on environment)
let transporter;

// Initialize email transporter
const initTransporter = async () => {
  if (process.env.NODE_ENV === 'production' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Production - Use Gmail/SMTP
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('✅ Email transporter configured for production');
  } else {
    // Development - Use Ethereal (fake email for testing)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('📧 Ethereal test email account created');
    console.log('📧 Preview URL: https://ethereal.email/messages');
  }
  
  // Verify connection
  transporter.verify((error, success) => {
    if (error) {
      console.log('⚠️ Email configuration error:', error.message);
    } else {
      console.log('✅ Email server is ready');
    }
  });
};

// Initialize on module load
initTransporter();

/**
 * Submit contact form (User/Coach)
 * @route POST /api/contact/submit
 */
exports.submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message, userId, userRole } = req.body;

  // Save to database
  const contact = await Contact.create({
    name,
    email,
    subject,
    message,
    userId: userId || null,
    userRole: userRole || 'user',
    status: 'pending'
  });

  // Send auto-reply email to user
  try {
    const emailSubject = subject 
      ? `Re: ${subject}` 
      : 'Thank you for contacting FitnessPro';
    
    const info = await transporter.sendMail({
      from: `"FitnessPro Support" <${process.env.EMAIL_USER || 'noreply@fitnesspro.com'}>`,
      to: email,
      subject: emailSubject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background-color: #f3f4f6;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #2563eb, #7c3aed);
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .header p {
              color: rgba(255,255,255,0.9);
              margin: 10px 0 0;
              font-size: 14px;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .message-box {
              background: #f9fafb;
              padding: 20px;
              border-radius: 12px;
              margin: 25px 0;
              border-left: 4px solid #2563eb;
            }
            .message-label {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #6b7280;
              margin-bottom: 10px;
            }
            .message-text {
              color: #374151;
              line-height: 1.6;
              margin: 0;
            }
            .info-box {
              background: #eff6ff;
              padding: 15px;
              border-radius: 12px;
              margin: 20px 0;
            }
            .info-title {
              font-weight: 600;
              color: #1e40af;
              margin-bottom: 10px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #2563eb, #7c3aed);
              color: white;
              padding: 12px 28px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 500;
              margin: 20px 0;
            }
            .footer {
              background: #f9fafb;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 5px 0;
              font-size: 12px;
              color: #6b7280;
            }
            .social-links {
              margin-top: 15px;
            }
            .social-links a {
              color: #6b7280;
              text-decoration: none;
              margin: 0 10px;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div style="padding: 20px;">
            <div class="container">
              <div class="header">
                <h1>🏋️‍♂️ FitnessPro</h1>
                <p>Your Fitness Journey Starts Here</p>
              </div>
              <div class="content">
                <div class="greeting">Dear ${name},</div>
                <p>Thank you for reaching out to <strong>FitnessPro Support</strong>. We have received your message and our team will get back to you within <strong>24-48 hours</strong>.</p>
                
                <div class="message-box">
                  <div class="message-label">Your Message:</div>
                  <p class="message-text">${message.replace(/\n/g, '<br>')}</p>
                </div>
                
                <div class="info-box">
                  <div class="info-title">📌 What happens next?</div>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li>Our support team will review your inquiry</li>
                    <li>You'll receive a response within 24-48 hours</li>
                    <li>Check your email (including spam folder) for updates</li>
                  </ul>
                </div>
                
                <div style="text-align: center;">
                  <a href="http://localhost:3001" class="button">Visit FitnessPro</a>
                </div>
                
                <p style="margin-top: 25px;">In the meantime, you can also:</p>
                <ul>
                  <li>Check our <a href="http://localhost:3001/faq" style="color: #2563eb;">FAQ section</a> for quick answers</li>
                  <li>Browse our <a href="http://localhost:3001/blog" style="color: #2563eb;">blog</a> for fitness tips</li>
                </ul>
              </div>
              <div class="footer">
                <p><strong>FitnessPro Support Team</strong></p>
                <p>123 Fitness Street, Casablanca, Morocco</p>
                <p>Email: support@fitnesspro.com | Phone: +212 5XX XXX XXX</p>
                <div class="social-links">
                  <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">Twitter</a>
                </div>
                <p style="margin-top: 15px;">&copy; 2024 FitnessPro. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Dear ${name},

Thank you for reaching out to FitnessPro Support. We have received your message and our team will get back to you within 24-48 hours.

Your message: ${message}

What happens next?
- Our support team will review your inquiry
- You'll receive a response within 24-48 hours
- Check your email (including spam folder) for updates

In the meantime, you can also:
- Check our FAQ section for quick answers
- Browse our blog for fitness tips

Best regards,
FitnessPro Support Team

---
FitnessPro | Your Fitness Journey Starts Here
123 Fitness Street, Casablanca, Morocco
support@fitnesspro.com
      `
    });
    
    console.log(`✅ Auto-reply email sent to ${email}`);
    
    // Log ethereal preview URL if in development
    if (process.env.NODE_ENV !== 'production' && info.messageId) {
      console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
  } catch (emailError) {
    console.error('❌ Failed to send auto-reply email:', emailError.message);
    // Don't throw error - we still want to save the contact
  }

  res.status(201).json({
    status: 'success',
    message: 'Contact message submitted successfully',
    data: { contact }
  });
});

/**
 * Get all contact messages (Admin only)
 * @route GET /api/admin/contacts
 */
exports.getAllContacts = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }

  const { status, page = 1, limit = 20 } = req.query;
  
  const query = {};
  if (status) query.status = status;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const contacts = await Contact.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('userId', 'name email profilePicture');
  
  const total = await Contact.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    results: contacts.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: { contacts }
  });
});

/**
 * Get single contact message (Admin only)
 * @route GET /api/admin/contacts/:id
 */
exports.getContactById = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }
  
  const contact = await Contact.findById(req.params.id).populate('userId', 'name email profilePicture');
  
  if (!contact) {
    throw new AppError('Contact message not found', 404);
  }
  
  // Mark as read if it was pending
  if (contact.status === 'pending') {
    contact.status = 'read';
    await contact.save();
  }
  
  res.status(200).json({
    status: 'success',
    data: { contact }
  });
});

/**
 * Update contact status (Admin only)
 * @route PATCH /api/admin/contacts/:id/status
 */
exports.updateContactStatus = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }
  
  const { status, adminNote } = req.body;
  
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    throw new AppError('Contact message not found', 404);
  }
  
  if (status) contact.status = status;
  if (adminNote !== undefined) contact.adminNote = adminNote;
  if (status === 'replied') contact.repliedAt = new Date();
  
  await contact.save();
  
  res.status(200).json({
    status: 'success',
    data: { contact }
  });
});

/**
 * Delete contact message (Admin only)
 * @route DELETE /api/admin/contacts/:id
 */
exports.deleteContact = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }
  
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) {
    throw new AppError('Contact message not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Contact message deleted successfully'
  });
});

/**
 * Get contact statistics (Admin only)
 * @route GET /api/admin/contacts/stats
 */
exports.getContactStats = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  
  const stats = {
    total: await Contact.countDocuments(),
    pending: await Contact.countDocuments({ status: 'pending' }),
    read: await Contact.countDocuments({ status: 'read' }),
    replied: await Contact.countDocuments({ status: 'replied' }),
    resolved: await Contact.countDocuments({ status: 'resolved' }),
    today: await Contact.countDocuments({
      createdAt: { $gte: today }
    }),
    thisWeek: await Contact.countDocuments({
      createdAt: { $gte: weekAgo }
    })
  };
  
  res.status(200).json({
    status: 'success',
    data: { stats }
  });
});

/**
 * Send manual reply from admin (with email)
 * @route POST /api/admin/contacts/:id/reply
 */
exports.sendReply = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }
  
  const { id } = req.params;
  const { replyMessage, subject } = req.body;
  
  if (!replyMessage) {
    throw new AppError('Reply message is required', 400);
  }
  
  const contact = await Contact.findById(id);
  if (!contact) {
    throw new AppError('Contact message not found', 404);
  }
  
  // Send reply email
  try {
    const info = await transporter.sendMail({
      from: `"FitnessPro Support" <${process.env.EMAIL_USER || 'noreply@fitnesspro.com'}>`,
      to: contact.email,
      subject: subject || `Re: ${contact.subject || 'Your inquiry'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { padding: 30px; }
            .reply-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div style="padding: 20px;">
            <div class="container">
              <div class="header">
                <h1>FitnessPro Support</h1>
              </div>
              <div class="content">
                <h2>Dear ${contact.name},</h2>
                <p>Thank you for your patience. Here is our response to your inquiry:</p>
                
                <div class="reply-box">
                  ${replyMessage.replace(/\n/g, '<br>')}
                </div>
                
                <p>If you have any further questions, please don't hesitate to reach out.</p>
                
                <p>Best regards,<br>
                <strong>FitnessPro Support Team</strong></p>
              </div>
              <div class="footer">
                <p>&copy; 2024 FitnessPro. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Dear ${contact.name},

Thank you for your patience. Here is our response to your inquiry:

${replyMessage}

If you have any further questions, please don't hesitate to reach out.

Best regards,
FitnessPro Support Team
      `
    });
    
    // Update contact status to replied
    contact.status = 'replied';
    contact.repliedAt = new Date();
    await contact.save();
    
    console.log(`✅ Reply email sent to ${contact.email}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Reply sent successfully'
    });
    
  } catch (error) {
    console.error('Failed to send reply email:', error);
    throw new AppError('Failed to send email reply', 500);
  }
});