const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Register validation
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Login validation
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Update password validation
const updatePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Register user
router.post('/register', registerValidation, validate, authController.register);

// Login user
router.post('/login', loginValidation, validate, authController.login);

// Get current user
router.get('/me', authenticate, authController.getMe);

// Update password
router.patch(
  '/update-password',
  authenticate,
  updatePasswordValidation,
  validate,
  authController.updatePassword
);

module.exports = router;