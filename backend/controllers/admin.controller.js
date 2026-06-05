const User = require('../models/user.model');
const Subscription = require('../models/subscription.model');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const notificationController = require('./notification.controller');

/**
 * Get all users
 * @route GET /api/admin/users
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 10, search } = req.query;
  
  // Build query
  const query = {};
  if (role) query.role = role;
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Pagination
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    skip: (page - 1) * limit
  };
  
  // Get users with coach populated
  const users = await User.find(query)
    .select('-password')
    .populate('coach', 'name email profilePicture')
    .populate('subscription', 'plan status duration')
    .sort({ createdAt: -1 })
    .skip(options.skip)
    .limit(options.limit);
  
  // Get total count
  const total = await User.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    pages: Math.ceil(total / options.limit),
    currentPage: options.page,
    data: {
      users
    }
  });
});

/**
 * Get user details
 * @route GET /api/admin/users/:userId
 */
exports.getUserDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await User.findById(userId)
    .select('-password')
    .populate('subscription')
    .populate('coach', 'name email profilePicture bio specialty');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

/**
 * Create new user
 * @route POST /api/admin/users
 */
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }
  
  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      user: user.getProfile()
    }
  });
});

/**
 * Update user
 * @route PATCH /api/admin/users/:userId
 */
exports.updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, email, role, isActive, coach } = req.body;
  
  const updateData = { name, email, role, isActive, coach };
  
  // Remove undefined fields
  Object.keys(updateData).forEach(key => 
    updateData[key] === undefined && delete updateData[key]
  );
  
  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

/**
 * Delete user
 * @route DELETE /api/admin/users/:userId
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Prevent deleting your own account
  if (userId === req.user.id) {
    throw new AppError('Cannot delete your own account', 400);
  }
  
  const user = await User.findByIdAndDelete(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Assign coach to user
 * @route POST /api/admin/users/:userId/assign-coach
 */
exports.assignCoach = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { coachId } = req.body;
  
  // Check if coach exists and is a coach
  const coach = await User.findOne({ _id: coachId, role: 'coach' });
  if (!coach) {
    throw new AppError('Coach not found', 404);
  }
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  const oldCoach = user.coach;
  user.coach = coachId;
  await user.save();
  
  // Get updated user with populated coach
  const updatedUser = await User.findById(userId)
    .select('-password')
    .populate('coach', 'name email profilePicture');
  
  // SEND NOTIFICATION TO USER (Client)
  await notificationController.createNotification(
    userId,
    'coach_assigned',
    '👨‍🏫 Coach Assigned!',
    `You have been assigned to ${coach.name} as your personal coach. They will guide you through your fitness journey.`,
    {
      coachId: coach._id,
      coachName: coach.name,
      coachEmail: coach.email
    }
  );
  
  // SEND NOTIFICATION TO COACH
  if (oldCoach?.toString() !== coachId) {
    await notificationController.createNotification(
      coachId,
      'coach_assigned',
      '📋 New Client Assigned',
      `${user.name} has been assigned to you as a new client.`,
      {
        clientId: user._id,
        clientName: user.name,
        clientEmail: user.email
      }
    );
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

/**
 * Remove coach from user
 * @route POST /api/admin/users/:userId/remove-coach
 */
exports.removeCoach = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Check if user exists
  const user = await User.findById(userId).populate('coach', 'name');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  const coachName = user.coach?.name;
  user.coach = null;
  await user.save();
  
  // Get updated user
  const updatedUser = await User.findById(userId)
    .select('-password')
    .populate('coach', 'name email profilePicture');
  
  // SEND NOTIFICATION FOR COACH REMOVAL
  if (coachName) {
    await notificationController.createNotification(
      userId,
      'coach_assigned',
      '👋 Coach Removed',
      `You are no longer assigned to ${coachName}. A new coach may be assigned soon.`,
      { previousCoach: coachName }
    );
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
      message: 'Coach removed successfully'
    }
  });
});

/**
 * Get all coaches (for dropdown)
 * @route GET /api/admin/coaches
 */
exports.getAllCoaches = asyncHandler(async (req, res) => {
  const coaches = await User.find({ role: 'coach', isActive: true })
    .select('name email profilePicture bio specialty')
    .sort({ name: 1 });
  
  res.status(200).json({
    status: 'success',
    results: coaches.length,
    data: {
      coaches
    }
  });
});

/**
 * Get all subscriptions
 * @route GET /api/admin/subscriptions
 */
exports.getAllSubscriptions = asyncHandler(async (req, res) => {
  const { status, plan, page = 1, limit = 10 } = req.query;
  
  // Build query
  const query = {};
  if (status) query.status = status;
  if (plan) query.plan = plan;
  
  // Pagination
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    skip: (page - 1) * limit
  };
  
  // Get subscriptions
  const subscriptions = await Subscription.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(options.skip)
    .limit(options.limit);
  
  // Get total count
  const total = await Subscription.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    results: subscriptions.length,
    total,
    pages: Math.ceil(total / options.limit),
    currentPage: options.page,
    data: {
      subscriptions
    }
  });
});

/**
 * Get subscription details
 * @route GET /api/admin/subscriptions/:subscriptionId
 */
exports.getSubscriptionDetails = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;
  
  const subscription = await Subscription.findById(subscriptionId)
    .populate('user', 'name email');
  
  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      subscription
    }
  });
});

/**
 * Create subscription (Admin) - WITH NOTIFICATION
 * @route POST /api/admin/subscriptions
 */
exports.createSubscription = asyncHandler(async (req, res) => {
  const { 
    userId, plan, duration, startDate = new Date(),
    paymentMethod, autoRenew = true
  } = req.body;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Get plan details
  const plans = Subscription.getPlans();
  if (!plans[plan]) {
    throw new AppError('Invalid subscription plan', 400);
  }
  
  // Calculate end date based on duration
  let endDate = new Date(startDate);
  switch (duration) {
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'quarterly':
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case 'yearly':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    default:
      throw new AppError('Invalid duration', 400);
  }
  
  // Get price from plan details
  const price = plans[plan].price[duration];
  
  // Create subscription
  const subscription = await Subscription.create({
    user: userId,
    plan,
    price,
    duration,
    startDate,
    endDate,
    paymentMethod,
    features: plans[plan].features,
    autoRenew,
    status: 'active',
    paymentStatus: 'paid',
    paymentDate: new Date()
  });
  
  // Update user's subscription
  user.subscription = subscription._id;
  await user.save();
  
  // SEND NOTIFICATION TO USER
  try {
    await notificationController.createNotification(
      userId,
      'subscription',
      '🎉 Subscription Activated!',
      `Your ${plan.toUpperCase()} subscription has been activated. You now have access to all ${plan} features for ${duration}.`,
      {
        subscriptionId: subscription._id,
        plan: plan,
        price: price,
        duration: duration,
        endDate: endDate,
        features: plans[plan].features
      }
    );
    console.log(`✅ Notification sent to user ${userId} for subscription activation`);
  } catch (notifError) {
    console.error('Failed to send notification:', notifError);
    // Don't throw - subscription still works
  }
  
  res.status(201).json({
    status: 'success',
    data: {
      subscription
    }
  });
});

/**
 * Mark subscription as paid (Admin)
 * @route POST /api/admin/subscriptions/:subscriptionId/mark-paid
 */
exports.markSubscriptionAsPaid = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;
  const { paymentReference } = req.body;
  
  const subscription = await Subscription.findById(subscriptionId).populate('user');
  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }
  
  subscription.paymentStatus = 'paid';
  subscription.status = 'active';
  subscription.paymentDate = new Date();
  if (paymentReference) {
    subscription.paymentReference = paymentReference;
  }
  await subscription.save();
  
  // Update user's subscription reference
  await User.findByIdAndUpdate(subscription.user._id, { subscription: subscription._id });
  
  // SEND NOTIFICATION FOR PAYMENT CONFIRMATION
  await notificationController.createNotification(
    subscription.user._id,
    'subscription_payment',
    '💰 Payment Received!',
    `Your payment of ${subscription.price} MAD for the ${subscription.plan} plan has been confirmed. Your subscription is now active until ${new Date(subscription.endDate).toLocaleDateString()}.`,
    {
      subscriptionId: subscription._id,
      plan: subscription.plan,
      price: subscription.price,
      endDate: subscription.endDate,
      paymentReference
    }
  );
  
  res.status(200).json({
    status: 'success',
    data: { subscription }
  });
});

/**
 * Update subscription
 * @route PATCH /api/admin/subscriptions/:subscriptionId
 */
exports.updateSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;
  const { status, endDate, autoRenew } = req.body;
  
  const subscription = await Subscription.findById(subscriptionId).populate('user');
  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }
  
  const oldStatus = subscription.status;
  const updateData = { status, endDate, autoRenew };
  
  // Remove undefined fields
  Object.keys(updateData).forEach(key => 
    updateData[key] === undefined && delete updateData[key]
  );
  
  const updatedSubscription = await Subscription.findByIdAndUpdate(
    subscriptionId,
    updateData,
    { new: true, runValidators: true }
  );
  
  // Send notification based on status change
  if (oldStatus !== status && subscription.user) {
    if (status === 'active') {
      await notificationController.createNotification(
        subscription.user._id,
        'subscription',
        '✅ Subscription Reactivated',
        `Your ${subscription.plan} subscription has been reactivated. Welcome back!`,
        { subscriptionId, plan: subscription.plan }
      );
    } else if (status === 'cancelled') {
      await notificationController.createNotification(
        subscription.user._id,
        'subscription',
        '❌ Subscription Cancelled',
        `Your ${subscription.plan} subscription has been cancelled.`,
        { subscriptionId, plan: subscription.plan }
      );
    } else if (status === 'expired') {
      await notificationController.createNotification(
        subscription.user._id,
        'subscription_expiring',
        '⚠️ Subscription Expired',
        `Your ${subscription.plan} subscription has expired. Please renew to continue accessing premium features.`,
        { subscriptionId, plan: subscription.plan }
      );
    }
  }
  
  res.status(200).json({
    status: 'success',
    data: { subscription: updatedSubscription }
  });
});