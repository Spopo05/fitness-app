const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const contactController = require('../controllers/contact.controller'); // Add this import
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
  body('role').optional().isIn(['user', 'coach', 'admin']).withMessage('Invalid role')
];

// Subscription validation
const subscriptionValidation = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('plan').isIn(['basic', 'premium', 'elite']).withMessage('Invalid plan'),
  body('duration').isIn(['monthly', 'quarterly', 'yearly']).withMessage('Invalid duration'),
  body('paymentMethod').optional().notEmpty().withMessage('Payment method is required'),
  body('autoRenew').optional().isBoolean().withMessage('Auto renew must be a boolean'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date format')
];

// Coach assignment validation
const assignCoachValidation = [
  body('coachId').notEmpty().withMessage('Coach ID is required')
];

// Extend trial validation
const extendTrialValidation = [
  body('days').optional().isInt({ min: 1, max: 30 }).withMessage('Days must be between 1 and 30')
];

// Mark subscription as paid validation
const markPaidValidation = [
  body('paymentReference').optional().trim().notEmpty().withMessage('Payment reference cannot be empty')
];

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['admin']));

// ============ CONTACT MANAGEMENT ROUTES ============
router.get('/contacts', contactController.getAllContacts);
router.get('/contacts/stats', contactController.getContactStats);
router.get('/contacts/:id', contactController.getContactById);
router.patch('/contacts/:id/status', contactController.updateContactStatus);
router.delete('/contacts/:id', contactController.deleteContact);
router.post('/contacts/:id/reply', contactController.sendReply);

// ============ IMPORTANT: SPECIFIC ROUTES MUST COME BEFORE PARAMETER ROUTES ============

// Free trial routes (SPECIFIC - must come BEFORE /users/:userId)
router.get('/users/free-trial', adminController.getFreeTrialUsers);
router.get('/free-trial/stats', adminController.getFreeTrialStats);
router.post('/users/:userId/extend-trial', extendTrialValidation, validate, adminController.extendFreeTrial);

// Coaches list route (SPECIFIC)
router.get('/coaches', adminController.getAllCoaches);

// User management routes (PARAMETER routes come AFTER specific routes)
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.post('/users', userValidation, validate, adminController.createUser);
router.patch('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);
router.post('/users/:userId/assign-coach', assignCoachValidation, validate, adminController.assignCoach);
router.post('/users/:userId/remove-coach', adminController.removeCoach);

// Subscription management routes
router.get('/subscriptions', adminController.getAllSubscriptions);
router.get('/subscriptions/:subscriptionId', adminController.getSubscriptionDetails);
router.post('/subscriptions', subscriptionValidation, validate, adminController.createSubscription);
router.post('/subscriptions/:subscriptionId/mark-paid', markPaidValidation, validate, adminController.markSubscriptionAsPaid);
router.patch('/subscriptions/:subscriptionId', adminController.updateSubscription);

module.exports = router;