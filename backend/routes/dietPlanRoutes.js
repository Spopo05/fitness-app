const express = require('express');
const { authenticate, authorize, requireActiveSubscription } = require('../middleware/auth');
const dietPlanController = require('../controllers/dietPlan.controller');

const router = express.Router();

// Apply auth and subscription check middleware to all routes here
router.use(authenticate);
router.use(requireActiveSubscription);

// Get the current logged-in user's diet plan
router.get('/my', dietPlanController.getMyDietPlan);

// Get all diet plans history for current user
router.get('/history', dietPlanController.getDietPlanHistory);

// Mark diet plan as completed (eaten)
router.patch('/:dietPlanId/complete', dietPlanController.markAsCompleted);

// Reactivate a diet plan
router.patch('/:dietPlanId/reactivate', dietPlanController.reactivateDietPlan);

// 🧑‍🏫 Route for coach to get a user's diet plan by user ID
router.get('/user/:userId', authorize(['coach']), dietPlanController.getUserDietPlanByCoach);

// Get, update, delete diet plan by ID
router.get('/:dietPlanId', dietPlanController.getDietPlan);
router.patch('/:dietPlanId', dietPlanController.updateDietPlan);
router.delete('/:dietPlanId', dietPlanController.deleteDietPlan);

module.exports = router;