const DietPlan = require('../models/dietPlan.model');
const User = require('../models/user.model');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Get diet plan by ID
 * @route GET /api/diet-plans/:dietPlanId
 */
exports.getDietPlan = asyncHandler(async (req, res) => {
  const { dietPlanId } = req.params;
  
  const dietPlan = await DietPlan.findById(dietPlanId);
  
  if (!dietPlan) {
    throw new AppError('Diet plan not found', 404);
  }
  
  // Check if user has access to this diet plan
  if (!dietPlan.user.equals(req.user._id) && 
      !dietPlan.coach?.equals(req.user._id) && 
      req.user.role !== 'admin') {
    throw new AppError('You do not have access to this diet plan', 403);
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      dietPlan
    }
  });
});

/**
 * Get current user's diet plan
 * @route GET /api/diet-plans/my
 */
exports.getMyDietPlan = asyncHandler(async (req, res) => {
  const dietPlan = await DietPlan.findOne({ 
    user: req.user._id,
    isActive: true,
    isCompleted: { $ne: true },
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!dietPlan) {
    throw new AppError('No active diet plan found for this user', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      dietPlan
    }
  });
});

/**
 * Update diet plan (coach or admin only)
 * @route PATCH /api/diet-plans/:dietPlanId
 */
exports.updateDietPlan = asyncHandler(async (req, res) => {
  const { dietPlanId } = req.params;
  const updateData = req.body;
  
  const dietPlan = await DietPlan.findById(dietPlanId);
  
  if (!dietPlan) {
    throw new AppError('Diet plan not found', 404);
  }
  
  // Only coach who created the plan or admin can update it
  if (!dietPlan.coach?.equals(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You do not have permission to update this diet plan', 403);
  }
  
  // Update fields
  Object.keys(updateData).forEach(key => {
    dietPlan[key] = updateData[key];
  });
  
  dietPlan.updatedAt = new Date();
  await dietPlan.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      dietPlan
    }
  });
});

/**
 * Delete diet plan (coach or admin only)
 * @route DELETE /api/diet-plans/:dietPlanId
 */
exports.deleteDietPlan = asyncHandler(async (req, res) => {
  const { dietPlanId } = req.params;
  
  const dietPlan = await DietPlan.findById(dietPlanId);
  
  if (!dietPlan) {
    throw new AppError('Diet plan not found', 404);
  }
  
  // Only coach who created the plan or admin can delete it
  if (!dietPlan.coach?.equals(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You do not have permission to delete this diet plan', 403);
  }
  
  // Remove reference from user's dietPlans array
  await User.findByIdAndUpdate(dietPlan.user, { 
    $pull: { dietPlans: dietPlanId }
  });
  
  // Delete diet plan
  await DietPlan.findByIdAndDelete(dietPlanId);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Get user's diet plan by coach
 * @route GET /api/diet-plans/user/:userId
 */
exports.getUserDietPlanByCoach = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Check if user is coach or admin
  if (req.user.role !== 'coach' && req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }
  
  const dietPlan = await DietPlan.findOne({ 
    user: userId,
    isActive: true,
    isCompleted: { $ne: true }
  }).sort({ createdAt: -1 });
  
  if (!dietPlan) {
    return res.status(404).json({ 
      status: 'fail',
      message: 'No diet plan found for this user' 
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      dietPlan
    }
  });
});

/**
 * Mark diet plan as completed (eaten)
 * @route PATCH /api/diet-plans/:dietPlanId/complete
 */
exports.markAsCompleted = asyncHandler(async (req, res) => {
  const { dietPlanId } = req.params;
  
  const dietPlan = await DietPlan.findById(dietPlanId);
  
  if (!dietPlan) {
    throw new AppError('Diet plan not found', 404);
  }
  
  // Check if user owns this diet plan
  if (!dietPlan.user.equals(req.user._id)) {
    throw new AppError('You do not have access to this diet plan', 403);
  }
  
  // Check if already completed
  if (dietPlan.isCompleted) {
    throw new AppError('This diet plan has already been marked as eaten', 400);
  }
  
  // Mark as completed
  dietPlan.isCompleted = true;
  dietPlan.completedAt = new Date();
  dietPlan.isActive = false;
  
  await dietPlan.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Diet plan marked as eaten successfully!',
    data: {
      dietPlan
    }
  });
});

/**
 * Get all diet plans for current user (with history)
 * @route GET /api/diet-plans/history
 */
exports.getDietPlanHistory = asyncHandler(async (req, res) => {
  const dietPlans = await DietPlan.find({ user: req.user._id })
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: dietPlans.length,
    data: {
      dietPlans
    }
  });
});

/**
 * Reactivate an expired or completed diet plan
 * @route PATCH /api/diet-plans/:dietPlanId/reactivate
 */
exports.reactivateDietPlan = asyncHandler(async (req, res) => {
  const { dietPlanId } = req.params;
  const { expiresInHours } = req.body;
  
  const dietPlan = await DietPlan.findById(dietPlanId);
  
  if (!dietPlan) {
    throw new AppError('Diet plan not found', 404);
  }
  
  // Check if user owns this diet plan
  if (!dietPlan.user.equals(req.user._id) && !dietPlan.coach?.equals(req.user._id)) {
    throw new AppError('You do not have access to this diet plan', 403);
  }
  
  // Reactivate the plan
  dietPlan.isCompleted = false;
  dietPlan.isActive = true;
  dietPlan.completedAt = null;
  
  // Set new expiration date
  if (expiresInHours) {
    dietPlan.expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  } else {
    dietPlan.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  
  await dietPlan.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Diet plan reactivated successfully',
    data: {
      dietPlan
    }
  });
});