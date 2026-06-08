// backend/routes/coachRoutes.js
const express = require('express');
const { body, param } = require('express-validator');
const coachController = require('../controllers/coach.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const uploadCoachMedia = require('../middleware/uploadMedia');

const router = express.Router();

// ==================== PUBLIC ROUTES (No authentication needed) ====================
// This route MUST be before the authentication middleware
router.get('/:coachId/media/public', coachController.getPublicMedia);

// ==================== PROTECTED ROUTES (Authentication required) ====================
// All routes below require authentication and coach role
router.use(authenticate);
router.use(authorize(['coach', 'admin']));

// ==================== MEDIA ROUTES ====================
router.post('/media/upload', uploadCoachMedia, coachController.uploadMedia);
router.get('/media', coachController.getMedia);
router.delete('/media/:mediaId', coachController.deleteMedia);

// ==================== USER ROUTES ====================
router.get('/users', coachController.getUsers);
router.get('/users/:userId', coachController.getUserDetails);

// ==================== DIET PLAN ROUTES ====================
const dietPlanValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('targetCalories').optional().isNumeric().withMessage('Target calories must be a number'),
];

router.post('/users/:userId/diet-plan', dietPlanValidation, validate, coachController.createDietPlan);

// ==================== WORKOUT ROUTES ====================
const workoutValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['strength', 'cardio', 'flexibility', 'hiit', 'recovery', 'custom']).withMessage('Invalid workout type'),
];

router.post('/users/:userId/workouts', workoutValidation, validate, coachController.createWorkout);
router.get('/users/:userId/workouts', coachController.getUserWorkouts);
router.patch('/workouts/:workoutId', coachController.updateWorkout);

// ==================== CLIENT STATUS ROUTES ====================
router.get('/clients/status', coachController.getClientsDietStatus);

// ==================== DEBUG ROUTES ====================
router.get('/debug-subscriptions', coachController.debugSubscriptions);

module.exports = router;