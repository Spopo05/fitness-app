const User = require('../models/user.model');
const DietPlan = require('../models/dietPlan.model');
const Workout = require('../models/workout.model');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const notificationController = require('./notification.controller');

/**
 * Get coach's users
 * @route GET /api/coaches/users
 */
exports.getUsers = asyncHandler(async (req, res) => {
  if (req.user.role !== 'coach') {
    throw new AppError('Access denied', 403);
  }

  const users = await User.find({
    coach: req.user._id,
    role: 'user'
  }).select('name email profilePicture goals weightHistory subscription dietPlans');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

/**
 * Get user details
 * @route GET /api/coaches/users/:userId
 */
exports.getUserDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (req.user.role !== 'coach') {
    throw new AppError('Access denied', 403);
  }

  const user = await User.findOne({
    _id: userId,
    coach: req.user._id
  }).populate('dietPlans');

  if (!user) {
    throw new AppError('User not found or not assigned to you', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: user.getProfile()
    }
  });
});

/**
 * Create diet plan for user
 * @route POST /api/coaches/users/:userId/diet-plan
 */
exports.createDietPlan = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    title, description, targetCalories, macroSplit,
    meals, notes, startDate, endDate, expiresInHours
  } = req.body;

  if (req.user.role !== 'coach') {
    throw new AppError('Access denied', 403);
  }

  const user = await User.findOne({
    _id: userId,
    coach: req.user._id
  });

  if (!user) {
    throw new AppError('User not found or not assigned to you', 404);
  }

  // Calculate expiration date
  let expiresAt;
  if (expiresInHours) {
    expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  } else if (endDate) {
    expiresAt = new Date(endDate);
  } else {
    expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  const dietPlan = await DietPlan.create({
    user: userId,
    coach: req.user._id,
    title,
    description,
    targetCalories,
    macroSplit,
    meals,
    notes,
    startDate: startDate || new Date(),
    endDate: endDate || expiresAt,
    expiresAt,
    isActive: true
  });

  // Push to dietPlans array
  if (!user.dietPlans) {
    user.dietPlans = [];
  }
  user.dietPlans.push(dietPlan._id);
  await user.save();

  // After creating diet plan
  await notificationController.createNotification(
    userId,
    'diet_plan',
    'New Diet Plan',
    `Coach ${req.user.name} created a new diet plan for you`,
    { dietPlanId: dietPlan._id }
  );

  res.status(201).json({
    status: 'success',
    data: {
      dietPlan,
      expiresAt,
      expiresIn: `${expiresInHours || 24} hours`
    }
  });
});

/**
 * Create workout for user
 * @route POST /api/coaches/users/:userId/workouts
 */
exports.createWorkout = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    title, description, type, duration, targetMuscleGroups,
    difficulty, exercises, scheduledDate, notes
  } = req.body;

  if (req.user.role !== 'coach') {
    throw new AppError('Access denied', 403);
  }

  const user = await User.findOne({
    _id: userId,
    coach: req.user._id
  });

  if (!user) {
    throw new AppError('User not found or not assigned to you', 404);
  }

  const workout = await Workout.create({
    user: userId,
    coach: req.user._id,
    title,
    description,
    type,
    duration,
    targetMuscleGroups,
    difficulty,
    exercises,
    scheduledDate,
    notes,
    status: 'scheduled'
  });
  // After creating workout
  await notificationController.createNotification(
    userId,
    'workout',
    'New Workout',
    `Coach ${req.user.name} assigned a new workout for you`,
    { workoutId: workout._id }
  );
  res.status(201).json({
    status: 'success',
    data: {
      workout
    }
  });
});

/**
 * Get user's workouts
 * @route GET /api/coaches/users/:userId/workouts
 */
exports.getUserWorkouts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status, limit = 10 } = req.query;

  if (req.user.role !== 'coach') {
    throw new AppError('Access denied', 403);
  }

  const userExists = await User.exists({
    _id: userId,
    coach: req.user._id
  });

  if (!userExists) {
    throw new AppError('User not found or not assigned to you', 404);
  }

  const query = { user: userId, coach: req.user._id };
  if (status) {
    query.status = status;
  }

  const workouts = await Workout.find(query)
    .sort({ scheduledDate: -1 })
    .limit(Number(limit));

  res.status(200).json({
    status: 'success',
    results: workouts.length,
    data: {
      workouts
    }
  });
});

/**
 * Update workout
 * @route PATCH /api/coaches/workouts/:workoutId
 */
exports.updateWorkout = asyncHandler(async (req, res) => {
  const { workoutId } = req.params;
  const updateData = req.body;

  if (req.user.role !== 'coach') {
    throw new AppError('Access denied', 403);
  }

  const workout = await Workout.findOne({
    _id: workoutId,
    coach: req.user._id
  });

  if (!workout) {
    throw new AppError('Workout not found or not created by you', 404);
  }

  Object.keys(updateData).forEach(key => {
    workout[key] = updateData[key];
  });

  await workout.save();

  res.status(200).json({
    status: 'success',
    data: {
      workout
    }
  });
});

/**
 * Get all clients with their diet plan status
 * @route GET /api/coaches/clients/status
 */
exports.getClientsDietStatus = asyncHandler(async (req, res) => {
  if (req.user.role !== 'coach') {
    throw new AppError('Access denied', 403);
  }

  const users = await User.find({
    coach: req.user._id,
    role: 'user'
  }).populate({
    path: 'dietPlans',
    options: { sort: { createdAt: -1 }, limit: 1 }
  });

  const clientsWithStatus = users.map(user => {
    const latestPlan = user.dietPlans?.[0] || null;
    
    let status = 'no_plan';
    let statusText = 'No Plan';
    let statusColor = 'gray';
    
    if (latestPlan) {
      if (latestPlan.isCompleted) {
        status = 'completed';
        statusText = '✓ Eaten';
        statusColor = 'green';
      } else if (latestPlan.expiresAt && new Date() > new Date(latestPlan.expiresAt)) {
        status = 'expired';
        statusText = 'Expired';
        statusColor = 'red';
      } else {
        status = 'pending';
        statusText = '⏳ Not Eaten';
        statusColor = 'orange';
      }
    }
    
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      dietPlan: latestPlan ? {
        _id: latestPlan._id,
        title: latestPlan.title,
        targetCalories: latestPlan.targetCalories,
        isCompleted: latestPlan.isCompleted,
        completedAt: latestPlan.completedAt,
        expiresAt: latestPlan.expiresAt,
        createdAt: latestPlan.createdAt
      } : null,
      status,
      statusText,
      statusColor
    };
  });

  // Calculate stats
  const stats = {
    total: clientsWithStatus.length,
    completed: clientsWithStatus.filter(c => c.status === 'completed').length,
    pending: clientsWithStatus.filter(c => c.status === 'pending').length,
    expired: clientsWithStatus.filter(c => c.status === 'expired').length,
    noPlan: clientsWithStatus.filter(c => c.status === 'no_plan').length
  };

  res.status(200).json({
    status: 'success',
    data: {
      clients: clientsWithStatus,
      stats
    }
  });
});