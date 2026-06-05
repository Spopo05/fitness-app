const Subscription = require('../models/subscription.model');
const User = require('../models/user.model');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const notificationController = require('./notification.controller');

/**
 * Get available subscription plans
 * @route GET /api/subscriptions/plans
 */
exports.getPlans = asyncHandler(async (req, res) => {
  const plans = Subscription.getPlans();
  
  // Format plans with MAD currency
  const formattedPlans = Object.entries(plans).map(([key, plan]) => ({
    id: key,
    name: plan.name,
    prices: {
      monthly: {
        amount: plan.price.monthly,
        currency: 'MAD',
        formatted: `${plan.price.monthly} MAD`
      },
      quarterly: {
        amount: plan.price.quarterly,
        currency: 'MAD',
        formatted: `${plan.price.quarterly} MAD`,
        savings: Math.round((plan.price.monthly * 3 - plan.price.quarterly) / (plan.price.monthly * 3) * 100)
      },
      yearly: {
        amount: plan.price.yearly,
        currency: 'MAD',
        formatted: `${plan.price.yearly} MAD`,
        savings: Math.round((plan.price.monthly * 12 - plan.price.yearly) / (plan.price.monthly * 12) * 100)
      }
    },
    features: plan.features,
    popular: key === 'pro',
    bestValue: key === 'premium'
  }));
  
  res.status(200).json({
    status: 'success',
    data: {
      plans: formattedPlans,
      currency: 'MAD',
      currencySymbol: 'DH'
    }
  });
});

/**
 * Get current user's subscription
 * @route GET /api/subscriptions/current
 */
exports.getCurrentSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    user: req.user._id,
    status: 'active'
  }).populate('user', 'name email');
  
  if (!subscription) {
    return res.status(200).json({
      status: 'success',
      data: {
        subscription: null,
        message: 'No active subscription'
      }
    });
  }
  
  const isActive = subscription.isActive();
  if (!isActive && subscription.status === 'active') {
    subscription.status = 'expired';
    await subscription.save();
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      subscription: {
        ...subscription.toObject(),
        isActive,
        formattedPrice: subscription.formattedPrice(),
        daysRemaining: Math.max(0, Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)))
      }
    }
  });
});

/**
 * Create new subscription (User self-subscription)
 * @route POST /api/subscriptions/create
 */
exports.createSubscription = asyncHandler(async (req, res) => {
  const { planId, duration, paymentMethod } = req.body;
  
  const plans = Subscription.getPlans();
  const selectedPlan = plans[planId];
  
  if (!selectedPlan) {
    throw new AppError('Invalid subscription plan', 400);
  }
  
  const price = selectedPlan.price[duration];
  if (!price) {
    throw new AppError('Invalid duration', 400);
  }
  
  // Deactivate old subscriptions
  await Subscription.updateMany(
    { user: req.user._id, status: 'active' },
    { status: 'cancelled', cancelledAt: new Date() }
  );
  
  // Create new subscription
  const startDate = new Date();
  const subscription = new Subscription({
    user: req.user._id,
    plan: planId,
    price,
    currency: 'MAD',
    duration,
    startDate,
    endDate: new Date(),
    paymentMethod,
    status: 'active',
    paymentStatus: 'paid',
    paymentDate: new Date(),
    autoRenew: true,
    features: selectedPlan.features
  });
  
  subscription.endDate = subscription.calculateEndDate();
  await subscription.save();
  
  // Update user's subscription reference
  await User.findByIdAndUpdate(req.user._id, { subscription: subscription._id });
  
  // Send notification to user
  await notificationController.createNotification(
    req.user._id,
    'subscription',
    '🎉 Subscription Activated!',
    `Your ${selectedPlan.name} subscription has been activated. You now have access to all ${selectedPlan.name} features.`,
    {
      subscriptionId: subscription._id,
      plan: planId,
      price,
      duration,
      endDate: subscription.endDate,
      features: selectedPlan.features
    }
  );
  
  res.status(201).json({
    status: 'success',
    data: {
      subscription: {
        ...subscription.toObject(),
        formattedPrice: subscription.formattedPrice(),
        planDetails: selectedPlan
      }
    }
  });
});

/**
 * Cancel subscription
 * @route POST /api/subscriptions/cancel
 */
exports.cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    user: req.user._id,
    status: 'active'
  });
  
  if (!subscription) {
    throw new AppError('No active subscription found', 404);
  }
  
  subscription.status = 'cancelled';
  subscription.cancelledAt = new Date();
  subscription.autoRenew = false;
  await subscription.save();
  
  // Send notification to user
  await notificationController.createNotification(
    req.user._id,
    'subscription',
    '❌ Subscription Cancelled',
    `Your ${subscription.plan} subscription has been cancelled. You will lose access on ${new Date(subscription.endDate).toLocaleDateString()}.`,
    {
      subscriptionId: subscription._id,
      plan: subscription.plan,
      endDate: subscription.endDate
    }
  );
  
  res.status(200).json({
    status: 'success',
    data: {
      message: 'Subscription cancelled successfully',
      subscription
    }
  });
});

/**
 * Get subscription history
 * @route GET /api/subscriptions/history
 */
exports.getSubscriptionHistory = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({ user: req.user._id })
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: subscriptions.length,
    data: {
      subscriptions: subscriptions.map(sub => ({
        ...sub.toObject(),
        formattedPrice: sub.formattedPrice(),
        isActive: sub.isActive()
      }))
    }
  });
});

/**
 * Handle payment webhook (for CIH, Attijari, etc.)
 * @route POST /api/subscriptions/webhook
 */
exports.handleWebhook = asyncHandler(async (req, res) => {
  const { paymentReference, userId, planId, duration, paymentMethod } = req.body;
  
  // Verify payment with bank API (implement based on your payment provider)
  // This is a placeholder for actual payment verification
  
  const plans = Subscription.getPlans();
  const selectedPlan = plans[planId];
  if (!selectedPlan) {
    throw new AppError('Invalid subscription plan', 400);
  }
  
  const price = selectedPlan.price[duration];
  if (!price) {
    throw new AppError('Invalid duration', 400);
  }
  
  // Deactivate old subscriptions
  await Subscription.updateMany(
    { user: userId, status: 'active' },
    { status: 'cancelled', cancelledAt: new Date() }
  );
  
  const startDate = new Date();
  const subscription = new Subscription({
    user: userId,
    plan: planId,
    price,
    currency: 'MAD',
    duration,
    startDate,
    endDate: new Date(),
    paymentMethod: paymentMethod || 'bank_transfer',
    paymentReference,
    status: 'active',
    paymentStatus: 'paid',
    paymentDate: new Date(),
    autoRenew: true,
    features: selectedPlan.features
  });
  
  subscription.endDate = subscription.calculateEndDate();
  await subscription.save();
  
  // Update user's subscription reference
  await User.findByIdAndUpdate(userId, { subscription: subscription._id });
  
  // Send notification to user
  await notificationController.createNotification(
    userId,
    'subscription_payment',
    '💰 Payment Received!',
    `Your payment of ${price} MAD for the ${selectedPlan.name} plan has been confirmed. Your subscription is now active.`,
    {
      subscriptionId: subscription._id,
      plan: planId,
      price,
      duration,
      endDate: subscription.endDate,
      paymentReference
    }
  );
  
  res.status(200).json({
    status: 'success',
    message: 'Subscription activated successfully'
  });
});

/**
 * Check if user has active subscription
 * @route GET /api/subscriptions/check
 */
exports.checkSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    user: req.user._id,
    status: 'active'
  });
  
  const hasActiveSubscription = subscription && subscription.isActive();
  
  res.status(200).json({
    status: 'success',
    data: {
      hasActiveSubscription,
      subscription: hasActiveSubscription ? {
        plan: subscription.plan,
        endDate: subscription.endDate,
        daysRemaining: Math.max(0, Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)))
      } : null
    }
  });
});

/**
 * Renew subscription
 * @route POST /api/subscriptions/renew
 */
exports.renewSubscription = asyncHandler(async (req, res) => {
  const { paymentMethod } = req.body;
  
  const currentSubscription = await Subscription.findOne({
    user: req.user._id,
    status: 'active'
  });
  
  if (!currentSubscription) {
    throw new AppError('No active subscription to renew', 404);
  }
  
  const plans = Subscription.getPlans();
  const selectedPlan = plans[currentSubscription.plan];
  
  // Calculate new end date (extend from current end date)
  let newEndDate = new Date(currentSubscription.endDate);
  switch (currentSubscription.duration) {
    case 'monthly':
      newEndDate.setMonth(newEndDate.getMonth() + 1);
      break;
    case 'quarterly':
      newEndDate.setMonth(newEndDate.getMonth() + 3);
      break;
    case 'yearly':
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      break;
  }
  
  // Create renewal subscription record
  const renewalSubscription = new Subscription({
    user: req.user._id,
    plan: currentSubscription.plan,
    price: currentSubscription.price,
    currency: 'MAD',
    duration: currentSubscription.duration,
    startDate: currentSubscription.endDate,
    endDate: newEndDate,
    paymentMethod,
    status: 'active',
    paymentStatus: 'paid',
    paymentDate: new Date(),
    autoRenew: true,
    features: selectedPlan.features
  });
  
  await renewalSubscription.save();
  
  // Deactivate old subscription
  currentSubscription.status = 'expired';
  await currentSubscription.save();
  
  // Update user's subscription reference
  await User.findByIdAndUpdate(req.user._id, { subscription: renewalSubscription._id });
  
  // Send notification
  await notificationController.createNotification(
    req.user._id,
    'subscription',
    '🔄 Subscription Renewed',
    `Your ${selectedPlan.name} subscription has been renewed and is now active until ${newEndDate.toLocaleDateString()}.`,
    {
      subscriptionId: renewalSubscription._id,
      plan: currentSubscription.plan,
      price: currentSubscription.price,
      endDate: newEndDate
    }
  );
  
  res.status(200).json({
    status: 'success',
    data: {
      subscription: {
        ...renewalSubscription.toObject(),
        formattedPrice: renewalSubscription.formattedPrice()
      }
    }
  });
});