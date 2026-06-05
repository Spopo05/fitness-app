const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate, requireActiveSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const upload = require('../middleware/upload');

const router = express.Router();
const User = require('../models/user.model');

// Update profile validation
const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('height').optional().isNumeric().withMessage('Height must be a number'),
  body('goals').optional().isIn(['weight_loss', 'muscle_gain', 'maintenance', 'general_fitness'])
    .withMessage('Invalid goal'),
  body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL')
];

// Weight entry validation
const weightEntryValidation = [
  body('weight').isNumeric().withMessage('Weight must be a number'),
  body('date').optional().isISO8601().withMessage('Date must be valid')
];

// All routes require authentication
router.use(authenticate);

// ============================================
// PROFILE ROUTES - ADD THE MISSING GET PROFILE
// ============================================

// ADD THIS - Get user profile
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('coach', 'name email profilePicture')
      .populate('subscription', 'plan status duration endDate');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: user.getProfile()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Profile update routes
router.patch('/profile', updateProfileValidation, validate, userController.updateProfile);
router.post('/change-password', authenticate, userController.changePassword);

// Weight tracking routes (SPECIFIC - must come BEFORE /:userId)
router.post('/weight', weightEntryValidation, validate, userController.addWeightEntry);
router.get('/weight', userController.getWeightHistory);

// Diet plan routes - requires active subscription
router.get('/diet-plan', requireActiveSubscription, userController.getDietPlanForUser);
router.get('/diet-plans', requireActiveSubscription, userController.getAllDietPlans);
router.get('/diet-plan/current', requireActiveSubscription, userController.getCurrentDietPlan);

// Workout routes - requires active subscription
router.get('/workouts/upcoming', requireActiveSubscription, userController.getUpcomingWorkouts);
router.get('/workouts/history', requireActiveSubscription, userController.getWorkoutHistory);

// Coach routes - requires active subscription
router.get('/coach', requireActiveSubscription, userController.getCoach);

// Check email route
router.get('/check-email', async (req, res, next) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    next(error);
  }
});

// ============================================
// OTHER ROUTES
// ============================================

// Upload profile picture
router.post('/upload-profile-picture', upload.single('profilePicture'), userController.uploadProfilePicture);
router.delete('/profile-picture', userController.deleteProfilePicture);

// ============================================
// DYNAMIC ROUTES LAST (catch-all)
// ============================================

// Get user by ID (MUST BE LAST - after all specific routes)
router.get('/:userId', async (req, res, next) => {
  try {
    // Validate if the parameter is a valid ObjectId
    const isValidObjectId = req.params.userId.match(/^[0-9a-fA-F]{24}$/);
    if (!isValidObjectId) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;