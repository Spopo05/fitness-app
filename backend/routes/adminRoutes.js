const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

// User creation validation
const userValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['user', 'coach', 'admin']).withMessage('Invalid role')
];

// Subscription validation
const subscriptionValidation = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('plan').isIn(['basic', 'premium', 'elite']).withMessage('Invalid plan'),
  body('duration').isIn(['monthly', 'quarterly', 'yearly']).withMessage('Invalid duration'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required')
];

// Coach assignment validation
const assignCoachValidation = [
  body('coachId').notEmpty().withMessage('Coach ID is required')
];

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['admin']));

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.post('/users', userValidation, validate, adminController.createUser);
router.patch('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);
router.post('/users/:userId/assign-coach', assignCoachValidation, validate, adminController.assignCoach);
router.post('/users/:userId/remove-coach', adminController.removeCoach);

// Coaches list route
router.get('/coaches', adminController.getAllCoaches);

// Subscription management routes
router.get('/subscriptions', adminController.getAllSubscriptions);
router.get('/subscriptions/:subscriptionId', adminController.getSubscriptionDetails);
router.post('/subscriptions', subscriptionValidation, validate, adminController.createSubscription);
router.patch('/subscriptions/:subscriptionId', adminController.updateSubscription);

module.exports = router;