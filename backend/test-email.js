require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('=== EMAIL TEST ===');
  console.log('From:', process.env.EMAIL_USER);
  console.log('To:', 'the-email-you-are-signing-up-with@gmail.com');
  console.log('App Password set:', process.env.EMAIL_PASS ? 'Yes' : 'No');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  try {
    // First, verify connection
    await transporter.verify();
    console.log('✅ Gmail connection successful!');
    
    // Then try sending a test email
    const info = await transporter.sendMail({
      from: `"FitAI" <${process.env.EMAIL_USER}>`,
      to: 'the-email-you-are-signing-up-with@gmail.com', // Change this to your test email
      subject: 'Test Email from FitAI',
      text: 'This is a test email to verify your email configuration works!'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Email error:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Gmail response:', error.response);
    }
  }
}

testEmail();