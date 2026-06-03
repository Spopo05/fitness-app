const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
};

/**
 * Register a new user
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
  // Admin and coach roles should be assigned by an admin
  const validRole = role === 'admin' || role === 'coach' ? 'user' : role;
  
  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: validRole
  });
  
  // Generate token
  const token = generateToken(user._id);
  
  // Return user data (without password) and token
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: user.getProfile()
    }
  });
});

/**
 * Login user
 * @route POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Check if email and password exist
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }
  
  // Check if user exists and password is correct
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  
  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 401);
  }
  
  // Generate token
  const token = generateToken(user._id);
  
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
  // User is already available from auth middleware
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
  
  // Get user with password
  const user = await User.findById(req.user._id);
  
  // Check if current password is correct
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  // Generate new token
  const token = generateToken(user._id);
  
  res.status(200).json({
    status: 'success',
    token,
    message: 'Password updated successfully'
  });
});