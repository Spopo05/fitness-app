// backend/controllers/coach.controller.js
const User = require('../models/user.model');
const DietPlan = require('../models/dietPlan.model');
const Workout = require('../models/workout.model');
const Subscription = require('../models/subscription.model');
const Media = require('../models/media.model'); // Add this
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const notificationController = require('./notification.controller');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// ==================== MEDIA FUNCTIONS ====================

/**
 * Upload media (image/video) to coach profile
 * @route POST /api/coaches/media/upload
 */
exports.uploadMedia = asyncHandler(async (req, res) => {
  if (req.user.role !== 'coach') {
    throw new AppError('Access denied', 403);
  }

  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const file = req.file;
  const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
  
  // Build URL for the uploaded file
  const url = file.path.replace(/\\/g, '/');

  // Create media record in database
  const media = await Media.create({
    coach: req.user._id,
    url: url,
    type: mediaType,
    title: req.body.title || '',
    description: req.body.description || '',
    size: file.size,
    mimeType: file.mimetype
  });

  res.status(201).json({
    status: 'success',
    data: {
      media
    }
  });
});

/**
 * Get coach's media
 * @route GET /api/coaches/media
 */
exports.getMedia = asyncHandler(async (req, res) => {
  if (req.user.role !== 'coach') {
    throw new AppError('Access denied', 403);
  }

  const media = await Media.find({ coach: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: media.length,
    data: {
      media
    }
  });
});

/**
 * Delete media
 * @route DELETE /api/coaches/media/:mediaId
 */
exports.deleteMedia = asyncHandler(async (req, res) => {
  const { mediaId } = req.params;

  if (req.user.role !== 'coach') {
    throw new AppError('Access denied', 403);
  }

  const media = await Media.findOne({
    _id: mediaId,
    coach: req.user._id
  });

  if (!media) {
    throw new AppError('Media not found', 404);
  }

  // Delete file from filesystem
  const fullPath = path.join(__dirname, '..', media.url);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }

  // Delete database record
  await media.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Media deleted successfully'
  });
});

/**
 * Get public coach media (for client viewing)
 * @route GET /api/coaches/:coachId/media/public
 */
exports.getPublicMedia = asyncHandler(async (req, res) => {
  const { coachId } = req.params;

  const coach = await User.findById(coachId);
  if (!coach || coach.role !== 'coach') {
    throw new AppError('Coach not found', 404);
  }

  const media = await Media.find({ coach: coachId, isPublic: true })
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({
    status: 'success',
    results: media.length,
    data: {
      media
    }
  });
});

// ==================== DEBUG FUNCTIONS ====================

/**
 * DEBUG: Get subscription info for debugging
 * @route GET /api/coaches/debug-subscriptions
 */
exports.debugSubscriptions = asyncHandler(async (req, res) => {
  if (req.user.role !== 'coach') {
    throw new AppError('Access denied', 403);
  }

  const users = await User.find({
    coach: req.user._id,
    role: 'user'
  }).select('_id name email');

  const userIds = users.map(u => u._id.toString());
  const allSubscriptions = await Subscription.find({}).lean();
  const objectIdUserIds = users.map(u => new mongoose.Types.ObjectId(u._id));
  const userSubscriptions = await Subscription.find({ 
    user: { $in: objectIdUserIds }
  }).lean();

  res.status(200).json({
    status: 'success',
    data: {
      coachUsers: users,
      allSubscriptionsInDb: allSubscriptions,
      filteredSubscriptions: userSubscriptions,
      userIdsUsed: userIds
    }
  });
});

// ==================== USER FUNCTIONS ====================

/**
 * Get coach's users with subscription details
 * @route GET /api/coaches/users
 */
exports.getUsers = asyncHandler(async (req, res) => {
  if (req.user.role !== 'coach') {
    throw new AppError('Access denied', 403);
  }

  const users = await User.find({
    coach: req.user._id,
    role: 'user'
  }).select('name email profilePicture goals weightHistory freeTrialEnds freeTrialStart height createdAt');

  const objectIdUserIds = users.map(user => new mongoose.Types.ObjectId(user._id));
  
  const subscriptions = await Subscription.find({ 
    user: { $in: objectIdUserIds }
  }).sort({ createdAt: -1 }).lean();

  const subscriptionMap = new Map();
  subscriptions.forEach(sub => {
    const userId = sub.user.toString();
    if (!subscriptionMap.has(userId)) {
      subscriptionMap.set(userId, sub);
    }
  });

  const usersWithSubscriptions = users.map(user => {
    const userObj = user.toObject();
    const subscription = subscriptionMap.get(user._id.toString());
    
    if (subscription) {
      userObj.subscription = {
        id: subscription._id,
        plan: subscription.plan,
        status: subscription.status,
        price: subscription.price,
        duration: subscription.duration,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        paymentMethod: subscription.paymentMethod,
        autoRenew: subscription.autoRenew
      };
    } else {
      userObj.subscription = null;
    }
    
    return userObj;
  });

  res.status(200).json({
    status: 'success',
    results: usersWithSubscriptions.length,
    data: {
      users: usersWithSubscriptions
    }
  });
});

/**
 * Get user details with subscription
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
  }).select('-password').populate('dietPlans');

  if (!user) {
    throw new AppError('User not found or not assigned to you', 404);
  }

  const subscription = await Subscription.findOne({ 
    user: new mongoose.Types.ObjectId(userId) 
  }).sort({ createdAt: -1 }).lean();
  
  const userObj = user.toObject();
  if (subscription) {
    userObj.subscription = {
      id: subscription._id,
      plan: subscription.plan,
      status: subscription.status,
      price: subscription.price,
      duration: subscription.duration,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      paymentMethod: subscription.paymentMethod,
      autoRenew: subscription.autoRenew
    };
  } else {
    userObj.subscription = null;
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: userObj
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

  if (!user.dietPlans) {
    user.dietPlans = [];
  }
  user.dietPlans.push(dietPlan._id);
  await user.save();

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