const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/user.model');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
exports.authenticate = async (req, res, next) => {
  try {
    console.log(`Authentication request: ${req.method} ${req.originalUrl}`);
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No Bearer token found');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    console.log('Token:', token.substring(0, 10) + '...');
    
    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    console.log('Authenticated user:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} roles - Array of allowed roles
 */
exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden' });
    }
    
    next();
  };
};

/**
 * Check if user has an active subscription
 */
exports.requireActiveSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Admin and coach roles bypass subscription check
    if (['admin', 'coach'].includes(req.user.role)) {
      return next();
    }
    
    const user = await User.findById(req.user._id).populate('subscription');
    
    if (!user.subscription || user.subscription.status !== 'active') {
      return res.status(403).json({ message: 'Active subscription required' });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};