const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const subscriptionController = require('../controllers/subscription.controller');

// Public route - get plans (no auth needed)
router.get('/plans', subscriptionController.getPlans);

// Protected routes - require authentication
router.use(authenticate);

// Get current subscription
router.get('/current', subscriptionController.getCurrentSubscription);

// Check subscription status
router.get('/check', subscriptionController.checkSubscription);

// Create subscription
router.post('/create', subscriptionController.createSubscription);

// Cancel subscription
router.post('/cancel', subscriptionController.cancelSubscription);

// Renew subscription
router.post('/renew', subscriptionController.renewSubscription);

// Get subscription history
router.get('/history', subscriptionController.getSubscriptionHistory);

// Webhook for payment callbacks (no auth - called by payment provider)
router.post('/webhook', subscriptionController.handleWebhook);

module.exports = router;