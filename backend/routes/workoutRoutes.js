const express = require('express');
const workoutController = require('../controllers/workout.controller');
const { authenticate, requireActiveSubscription } = require('../middleware/auth');

const router = express.Router();

// Apply middleware to all workout routes
router.use(authenticate);
router.use(requireActiveSubscription);

// Specific routes first
router.get('/upcoming', workoutController.getUpcomingWorkouts);  // GET /api/workouts/upcoming
router.get('/history', workoutController.getWorkoutHistory);      // GET /api/workouts/history

// Routes with params last to avoid conflicts
router.get('/:workoutId', workoutController.getWorkout);
router.patch('/:workoutId/exercises/:exerciseId', workoutController.updateExerciseStatus);
router.patch('/:workoutId/complete', workoutController.markWorkoutCompleted);

module.exports = router;
