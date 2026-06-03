const User = require('../models/user.model');
const DietPlan = require('../models/dietPlan.model');
const Workout = require('../models/workout.model');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Update user profile
 * @route PATCH /api/users/profile
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email, height, goals, profilePicture, bio, specialty, certifications, experience, successRate, phone, location, linkedin, instagram, facebook, twitter } = req.body;
  
  const updateData = { 
    name, 
    email, 
    height, 
    goals, 
    profilePicture,
    bio,
    specialty,
    certifications,
    experience,
    successRate,
    phone,
    location,
    linkedin,
    instagram,
    facebook,
    twitter
  };
  
  // Remove undefined fields
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user: user.getProfile()
    }
  });
});

/**
 * Change password
 * @route POST /api/users/change-password
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current and new password', 400);
  }
  
  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }
  
  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Check current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully'
  });
});

/**
 * Upload profile picture
 * @route POST /api/users/upload-profile-picture
 */
exports.uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  // Get the file URL
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const profilePictureUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;

  // Update user's profile picture
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePicture: profilePictureUrl },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    message: 'Profile picture uploaded successfully',
    data: {
      user: user.getProfile()
    }
  });
});

/**
 * Delete profile picture
 * @route DELETE /api/users/profile-picture
 */
exports.deleteProfilePicture = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Delete the file from server if it exists
  if (user.profilePicture) {
    const filename = user.profilePicture.split('/').pop();
    const filePath = `uploads/profiles/${filename}`;
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // Remove profile picture reference
  user.profilePicture = '';
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Profile picture deleted successfully',
    data: {
      user: user.getProfile()
    }
  });
});

/**
 * Add weight entry
 * @route POST /api/users/weight
 */
exports.addWeightEntry = asyncHandler(async (req, res) => {
  const { weight, date = new Date() } = req.body;
  
  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  user.weightHistory.push({ weight, date });
  await user.save();
  
  res.status(201).json({
    status: 'success',
    data: {
      weightHistory: user.weightHistory
    }
  });
});

/**
 * Get weight history
 * @route GET /api/users/weight
 */
exports.getWeightHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  const weightHistory = user.weightHistory.sort((a, b) => b.date - a.date);
  
  res.status(200).json({
    status: 'success',
    data: {
      weightHistory
    }
  });
});

/**
 * Get user's diet plan
 * @route GET /api/users/diet-plan
 */
exports.getDietPlan = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('dietPlans');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  const currentDietPlan = user.dietPlans?.length > 0 
    ? user.dietPlans[user.dietPlans.length - 1] 
    : null;
  
  if (!currentDietPlan) {
    return res.status(200).json({
      status: 'success',
      message: 'No diet plan assigned yet',
      data: {
        dietPlan: null,
        hasActivePlan: false
      }
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      dietPlan: currentDietPlan,
      hasActivePlan: true
    }
  });
});

/**
 * Get user's diet plan (for user route)
 * @route GET /api/users/diet-plan (alternate)
 */
exports.getDietPlanForUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('dietPlans');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  const currentDietPlan = user.dietPlans?.length > 0 
    ? user.dietPlans[user.dietPlans.length - 1] 
    : null;

  if (!currentDietPlan) {
    throw new AppError('No diet plan assigned', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      dietPlan: currentDietPlan
    }
  });
});

/**
 * Get user's ALL diet plans (history) with expiration status
 * @route GET /api/users/diet-plans
 */
exports.getAllDietPlans = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'dietPlans',
    options: { sort: { createdAt: -1 } }
  });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  const dietPlansWithStatus = user.dietPlans.map(plan => ({
    ...plan.toObject(),
    isExpired: plan.isExpired ? plan.isExpired() : new Date() > plan.expiresAt,
    status: plan.status || (new Date() > plan.expiresAt ? 'expired' : 'active'),
    expiresAt: plan.expiresAt
  }));
  
  res.status(200).json({
    status: 'success',
    results: dietPlansWithStatus.length,
    data: {
      dietPlans: dietPlansWithStatus
    }
  });
});

/**
 * Get user's current/active diet plan (most recent, not expired)
 * @route GET /api/users/diet-plan/current
 */
exports.getCurrentDietPlan = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'dietPlans',
    match: { 
      isActive: true,
      expiresAt: { $gt: new Date() }
    },
    options: { sort: { createdAt: -1 }, limit: 1 }
  });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  const currentDietPlan = user.dietPlans?.[0] || null;
  
  if (!currentDietPlan) {
    return res.status(200).json({
      status: 'success',
      message: 'No active diet plan available',
      data: {
        dietPlan: null,
        hasActivePlan: false
      }
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      dietPlan: currentDietPlan,
      hasActivePlan: true,
      expiresAt: currentDietPlan.expiresAt,
      expiresIn: Math.max(0, Math.floor((new Date(currentDietPlan.expiresAt) - new Date()) / (1000 * 60 * 60)))
    }
  });
});

/**
 * Get upcoming workouts
 * @route GET /api/users/workouts/upcoming
 */
exports.getUpcomingWorkouts = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  
  const workouts = await Workout.find({
    user: req.user._id,
    status: 'scheduled',
    scheduledDate: { $gte: new Date() }
  })
    .sort({ scheduledDate: 1 })
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
 * Get workout history
 * @route GET /api/users/workouts/history
 */
exports.getWorkoutHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;
  
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    skip: (page - 1) * limit
  };
  
  const workouts = await Workout.find({
    user: userId,
    status: 'completed'
  })
  .sort({ completedDate: -1 })
  .skip(options.skip)
  .limit(options.limit);
  
  const total = await Workout.countDocuments({
    user: userId,
    status: 'completed'
  });
  
  res.status(200).json({
    status: 'success',
    results: workouts.length,
    total,
    pages: Math.ceil(total / options.limit),
    currentPage: options.page,
    data: {
      workouts: workouts || []
    }
  });
});

/**
 * Get assigned coach (with full profile data)
 * @route GET /api/users/coach
 */
exports.getCoach = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('coach');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.coach) {
    return res.status(404).json({ status: 'fail', message: 'No coach assigned' });
  }

  // Get full coach profile with all fields
  const coach = await User.findById(user.coach._id).select('-password');

  res.status(200).json({ 
    status: 'success', 
    data: { 
      coach: {
        _id: coach._id,
        name: coach.name,
        email: coach.email,
        profilePicture: coach.profilePicture,
        role: coach.role,
        bio: coach.bio || '',
        specialty: coach.specialty || '',
        certifications: coach.certifications || '',
        experience: coach.experience || '',
        successRate: coach.successRate || '',
        phone: coach.phone || '',
        location: coach.location || '',
        linkedin: coach.linkedin || '',
        instagram: coach.instagram || '',
        facebook: coach.facebook || '',
        twitter: coach.twitter || '',
        createdAt: coach.createdAt
      }
    } 
  });
});