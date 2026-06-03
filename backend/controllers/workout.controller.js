const Workout = require('../models/workout.model');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Get workout details
 * @route GET /api/workouts/:workoutId
 */
exports.getWorkout = asyncHandler(async (req, res) => {
  const { workoutId } = req.params;
  
  const workout = await Workout.findById(workoutId);
  
  if (!workout) {
    throw new AppError('Workout not found', 404);
  }
  
  // Check if user has access to this workout
  if (!workout.user.equals(req.user._id) && 
      !workout.coach?.equals(req.user._id) && 
      req.user.role !== 'admin') {
    throw new AppError('You do not have access to this workout', 403);
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      workout
    }
  });
});

/**
 * Update workout exercise status
 * @route PATCH /api/workouts/:workoutId/exercises/:exerciseId
 */
exports.updateExerciseStatus = asyncHandler(async (req, res) => {
  const { workoutId, exerciseId } = req.params;
  const { completed, weight, reps, notes } = req.body;
  
  const workout = await Workout.findById(workoutId);
  
  if (!workout) {
    throw new AppError('Workout not found', 404);
  }
  
  // Only the assigned user can update exercise status
  if (!workout.user.equals(req.user._id)) {
    throw new AppError('You do not have permission to update this workout', 403);
  }
  
  // Find the exercise in the workout
  const exercise = workout.exercises.id(exerciseId);
  if (!exercise) {
    throw new AppError('Exercise not found in workout', 404);
  }
  
  // Update exercise fields
  if (completed !== undefined) exercise.completed = completed;
  if (weight !== undefined) exercise.weight = weight;
  if (reps !== undefined) exercise.reps = reps;
  if (notes !== undefined) exercise.notes = notes;
  
  // If all exercises are completed, mark workout as completed
  const allCompleted = workout.exercises.every(ex => ex.completed);
  if (allCompleted) {
    workout.status = 'completed';
    workout.completedDate = new Date();
  }
  
  await workout.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      workout
    }
  });
});

/**
 * Mark workout as completed
 * @route PATCH /api/workouts/:workoutId/complete
 */
exports.markWorkoutCompleted = asyncHandler(async (req, res) => {
  const { workoutId } = req.params;
  
  const workout = await Workout.findById(workoutId);
  
  if (!workout) {
    throw new AppError('Workout not found', 404);
  }
  
  // Only the assigned user can mark workout as completed
  if (!workout.user.equals(req.user._id)) {
    throw new AppError('You do not have permission to update this workout', 403);
  }
  
  // Mark all exercises as completed
  workout.exercises.forEach(exercise => {
    exercise.completed = true;
  });
  
  // Update workout status
  workout.status = 'completed';
  workout.completedDate = new Date();
  
  await workout.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      workout
    }
  });
});
/**
 * Get upcoming workouts
 * @route GET /api/workouts/upcoming
 */
exports.getUpcomingWorkouts = asyncHandler(async (req, res) => {
  const upcomingWorkouts = await Workout.find({
    user: req.user._id,
    status: 'upcoming',
    scheduledDate: { $gte: new Date() },
  }).sort('scheduledDate');

  res.status(200).json({
    status: 'success',
    data: { workouts: upcomingWorkouts }
  });
});

/**
 * Get workout history
 * @route GET /api/workouts/history
 */
exports.getWorkoutHistory = asyncHandler(async (req, res) => {
  const completedWorkouts = await Workout.find({
    user: req.user._id,
    status: 'completed',
  }).sort('-completedDate');

  res.status(200).json({
    status: 'success',
    data: { workouts: completedWorkouts }
  });
});
