const express = require('express');
const { body, param } = require('express-validator');
const coachController = require('../controllers/coach.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

// Diet plan validation
const dietPlanValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('targetCalories').optional().isNumeric().withMessage('Target calories must be a number'),
  body('meals').isArray().withMessage('Meals must be an array'),
  body('meals.*.name').notEmpty().withMessage('Meal name is required'),
  body('meals.*.time').notEmpty().withMessage('Meal time is required')
];

// Workout validation
const workoutValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['strength', 'cardio', 'flexibility', 'hiit', 'recovery', 'custom'])
    .withMessage('Invalid workout type'),
  body('exercises').isArray().withMessage('Exercises must be an array'),
  body('exercises.*.name').notEmpty().withMessage('Exercise name is required'),
  body('exercises.*.sets').isNumeric().withMessage('Sets must be a number'),
  body('exercises.*.reps').notEmpty().withMessage('Reps are required')
];

// All routes require authentication and coach role
router.use(authenticate);
router.use(authorize(['coach', 'admin']));

// User routes
router.get('/users', coachController.getUsers);
router.get('/users/:userId', coachController.getUserDetails);

// Diet plan routes
router.post('/users/:userId/diet-plan', dietPlanValidation, validate, coachController.createDietPlan);

// Workout routes
router.post('/users/:userId/workouts', workoutValidation, validate, coachController.createWorkout);
router.get('/users/:userId/workouts', coachController.getUserWorkouts);
router.patch('/workouts/:workoutId', coachController.updateWorkout);

// NEW: Get clients with diet plan status
router.get('/clients/status', coachController.getClientsDietStatus);

module.exports = router;