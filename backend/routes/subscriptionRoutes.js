const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const subscriptionController = require('../controllers/subscription.controller');

// Get available plans
router.get('/plans', subscriptionController.getPlans);

// Get user's current subscription
router.get('/current', authenticate, subscriptionController.getCurrentSubscription);

// Create new subscription
router.post('/create', authenticate, subscriptionController.createSubscription);

// Cancel subscription
router.post('/cancel', authenticate, subscriptionController.cancelSubscription);

// Get subscription history
router.get('/history', authenticate, subscriptionController.getSubscriptionHistory);

// Webhook for payment callbacks
router.post('/webhook', subscriptionController.handleWebhook);

module.exports = router;