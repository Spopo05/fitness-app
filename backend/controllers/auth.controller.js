const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const Subscription = require('../models/subscription.model');
const config = require('../config');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
};

/**
 * Register a new user - NO AUTOMATIC FREE TRIAL
 * @route POST /api/auth/register
 */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }
  
  // For security, only allow user role during registration
  const validRole = role === 'admin' || role === 'coach' ? 'user' : role;
  
  // Create verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  // Create user WITHOUT automatic free trial
  const user = await User.create({
    name,
    email,
    password,
    role: validRole,
    emailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires,
    freeTrialUsed: false,
    freeTrialStart: null,
    freeTrialEnds: null
  });
  
  // Send verification email
  try {
    await sendVerificationEmail(email, name, verificationToken);
    console.log(`✅ Verification email sent to: ${email}`);
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
  }
  
  res.status(201).json({
    status: 'success',
    message: 'Registration successful! Please check your email to verify your account.',
    requiresVerification: true
  });
});

/**
 * Verify email
 * @route GET /api/auth/verify-email
 */
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.redirect(`${process.env.FRONTEND_URL}/verify-email?error=no-token`);
  }
  
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() }
  });
  
  if (!user) {
    const expiredUser = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $lt: new Date() }
    });
    
    if (expiredUser) {
      return res.redirect(`${process.env.FRONTEND_URL}/verify-email?error=expired&email=${expiredUser.email}`);
    }
    
    return res.redirect(`${process.env.FRONTEND_URL}/verify-email?error=invalid`);
  }
  
  user.emailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();
  
  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
  }
  
  res.redirect(`${process.env.FRONTEND_URL}/verify-email?success=true`);
});

/**
 * Resend verification email
 * @route POST /api/auth/resend-verification
 */
exports.resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  if (user.emailVerified) {
    throw new AppError('Email already verified', 400);
  }
  
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();
  
  await sendVerificationEmail(user.email, user.name, verificationToken);
  
  res.status(200).json({
    status: 'success',
    message: 'Verification email resent. Please check your inbox.'
  });
});

/**
 * Login user - EMAIL VERIFICATION CHECKED FIRST!
 * @route POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }
  
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  
  // ✅ STEP 1: CHECK EMAIL VERIFICATION FIRST (BEFORE ANYTHING ELSE)
  if (!user.emailVerified) {
    console.log(`❌ Login blocked: ${email} - Email not verified`);
    throw new AppError('Please verify your email before logging in. Check your inbox for the verification link.', 403);
  }
  
  // ✅ STEP 2: Check if user is active
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 401);
  }
  
  // ✅ STEP 3: Generate token (NO SUBSCRIPTION CHECK FOR LOGIN)
  const token = generateToken(user._id);
  
  console.log(`✅ Login successful: ${email}`);
  
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: user.getProfile()
    }
  });
});

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
exports.getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  
  res.status(200).json({
    status: 'success',
    data: {
      user: user.getProfile()
    }
  });
});

/**
 * Update password
 * @route PATCH /api/auth/update-password
 */
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user._id);
  
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }
  
  user.password = newPassword;
  await user.save();
  
  const token = generateToken(user._id);
  
  res.status(200).json({
    status: 'success',
    token,
    message: 'Password updated successfully'
  });
});

/**
 * Forgot password - Send reset email (SECURE VERSION)
 * @route POST /api/auth/forgot-password
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    throw new AppError('Please provide your email address', 400);
  }
  
  // Check if user exists
  const user = await User.findOne({ email });
  
  // ✅ IMPORTANT: Only send email if user exists AND is verified
  if (user && user.emailVerified) {
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    
    // Send email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
      console.log(`✅ Password reset email sent to: ${email}`);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();
      // Don't throw error, just log it
    }
  }
  
  // ✅ ALWAYS return the same message (whether user exists or not)
  res.status(200).json({
    status: 'success',
    message: 'If your email is registered and verified, you will receive a password reset link.'
  });
});

/**
 * Reset password
 * @route POST /api/auth/reset-password
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    throw new AppError('Please provide token and new password', 400);
  }
  
  if (newPassword.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }
  
  // Find user with valid token
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() }
  });
  
  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }
  
  // Update password
  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully. You can now login with your new password.'
  });
});