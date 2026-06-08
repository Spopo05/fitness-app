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
    bestValue: key === 'premium',
    hasFreeTrial: key === 'basic'
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
 * Get current user's subscription and free trial info
 * @route GET /api/subscriptions/current
 */
exports.getCurrentSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  // ✅ Only consider free trial active if user has used it AND end date is in future
  const hasActiveFreeTrial = user?.freeTrialUsed === true && 
                             user?.freeTrialEnds && 
                             new Date() < new Date(user.freeTrialEnds);
  
  // Get active subscription
  const subscription = await Subscription.findOne({
    user: req.user._id,
    status: 'active'
  }).populate('user', 'name email');
  
  let freeTrialInfo = null;
  
  if (hasActiveFreeTrial) {
    const daysRemaining = Math.ceil((new Date(user.freeTrialEnds) - new Date()) / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.ceil((new Date(user.freeTrialEnds) - new Date()) / (1000 * 60 * 60));
    
    freeTrialInfo = {
      isActive: true,
      startDate: user.freeTrialStart,
      endDate: user.freeTrialEnds,
      daysRemaining: daysRemaining,
      hoursRemaining: hoursRemaining,
      message: `Free trial active until ${new Date(user.freeTrialEnds).toLocaleString()}`
    };
    
    console.log(`✅ Free trial active for: ${user.email} until ${user.freeTrialEnds}`);
  } else if (user?.freeTrialUsed === true && user?.freeTrialEnds && new Date() > new Date(user.freeTrialEnds)) {
    // Expired free trial
    console.log(`⚠️ Free trial expired for: ${user.email} on ${user.freeTrialEnds}`);
  }
  
  if (!subscription && !hasActiveFreeTrial) {
    return res.status(200).json({
      status: 'success',
      data: {
        subscription: null,
        freeTrial: null,
        canStartFreeTrial: !user?.freeTrialUsed,
        message: 'No active subscription or free trial'
      }
    });
  }
  
  let subscriptionData = null;
  if (subscription) {
    const isActive = subscription.isActive();
    if (!isActive && subscription.status === 'active') {
      subscription.status = 'expired';
      await subscription.save();
    }
    
    subscriptionData = {
      ...subscription.toObject(),
      isActive,
      formattedPrice: subscription.formattedPrice(),
      daysRemaining: Math.max(0, Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)))
    };
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      subscription: subscriptionData,
      freeTrial: freeTrialInfo,
      canStartFreeTrial: !user?.freeTrialUsed
    }
  });
});

/**
 * Check if user can start free trial
 * @route GET /api/subscriptions/can-start-free-trial
 */
exports.canStartFreeTrial = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  const canStart = !user.freeTrialUsed;
  
  res.status(200).json({
    status: 'success',
    data: {
      canStartFreeTrial: canStart,
      hasUsedFreeTrial: user.freeTrialUsed === true,
      message: canStart ? 'You are eligible for a 7-day free trial on the Basic plan' : 'You have already used your free trial'
    }
  });
});

/**
 * Create new subscription (User self-subscription) with OPTIONAL FREE TRIAL
 * @route POST /api/subscriptions/create
 */
exports.createSubscription = asyncHandler(async (req, res) => {
  const { planId, duration, paymentMethod, useFreeTrial = false } = req.body;
  
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Check if user already has active free trial
  const hasActiveFreeTrial = user.freeTrialUsed === true && user.freeTrialEnds && new Date() < new Date(user.freeTrialEnds);
  
  if (hasActiveFreeTrial) {
    throw new AppError('You already have an active free trial', 400);
  }
  
  const plans = Subscription.getPlans();
  const selectedPlan = plans[planId];
  
  if (!selectedPlan) {
    throw new AppError('Invalid subscription plan', 400);
  }
  
  const price = selectedPlan.price[duration];
  if (!price) {
    throw new AppError('Invalid duration', 400);
  }
  
  // ✅ ONLY activate free trial if user explicitly chooses it AND it's Basic plan AND they haven't used it before
  const canUseFreeTrial = useFreeTrial === true && planId === 'basic' && user.freeTrialUsed !== true;
  
  let startDate = new Date();
  let endDate = new Date();
  let finalPrice = price;
  let paymentStatus = 'paid';
  let autoRenew = true;
  let isFreeTrial = false;
  
  if (canUseFreeTrial) {
    finalPrice = 0;
    endDate.setDate(endDate.getDate() + 7); // 7 days free trial
    paymentStatus = 'pending';
    autoRenew = false;
    isFreeTrial = true;
    
    // Update user's free trial status
    user.freeTrialUsed = true;
    user.freeTrialStart = startDate;
    user.freeTrialEnds = endDate;
    await user.save();
    
    console.log(`✅ Free trial ACTIVATED for: ${user.email} until ${endDate}`);
  } else {
    // Regular subscription - calculate end date based on duration
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
    }
    console.log(`✅ Subscription created for: ${user.email} - ${planId} plan`);
  }
  
  // Deactivate old subscriptions
  await Subscription.updateMany(
    { user: req.user._id, status: 'active' },
    { status: 'cancelled', cancelledAt: new Date() }
  );
  
  // Create new subscription
  const subscription = new Subscription({
    user: req.user._id,
    plan: planId,
    price: finalPrice,
    currency: 'MAD',
    duration: canUseFreeTrial ? 'monthly' : duration,
    startDate,
    endDate,
    paymentMethod,
    status: 'active',
    paymentStatus,
    paymentDate: new Date(),
    autoRenew,
    features: selectedPlan.features
  });
  
  await subscription.save();
  
  // Update user's subscription reference
  user.subscription = subscription._id;
  await user.save();
  
  // Send notification based on subscription type
  if (canUseFreeTrial) {
    await notificationController.createNotification(
      req.user._id,
      'subscription',
      '🎁 Free Trial Started!',
      `Your 7-day free trial for the Basic plan has started. You have until ${endDate.toLocaleDateString()} to enjoy all Basic features for free!`,
      {
        subscriptionId: subscription._id,
        plan: planId,
        trialDays: 7,
        trialEnds: endDate,
        isFreeTrial: true
      }
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        subscription: {
          ...subscription.toObject(),
          formattedPrice: subscription.formattedPrice(),
          planDetails: selectedPlan,
          isFreeTrial: true,
          trialEnds: endDate,
          trialDaysRemaining: 7
        },
        message: `Free trial activated! You have 7 days free until ${endDate.toLocaleDateString()}`
      }
    });
  } else {
    await notificationController.createNotification(
      req.user._id,
      'subscription',
      '🎉 Subscription Activated!',
      `Your ${selectedPlan.name} subscription has been activated. You now have access to all ${selectedPlan.name} features.`,
      {
        subscriptionId: subscription._id,
        plan: planId,
        price: finalPrice,
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
          planDetails: selectedPlan,
          isFreeTrial: false
        }
      }
    });
  }
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
  
  const user = await User.findById(req.user._id);
  
  res.status(200).json({
    status: 'success',
    results: subscriptions.length,
    data: {
      subscriptions: subscriptions.map(sub => ({
        ...sub.toObject(),
        formattedPrice: sub.formattedPrice(),
        isActive: sub.isActive()
      })),
      freeTrialUsed: user?.freeTrialUsed === true,
      freeTrialEnds: user?.freeTrialEnds || null
    }
  });
});

/**
 * Get free trial status
 * @route GET /api/subscriptions/free-trial-status
 */
exports.getFreeTrialStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  const hasUsedFreeTrial = user?.freeTrialUsed === true;
  const hasActiveFreeTrial = hasUsedFreeTrial && user?.freeTrialEnds && new Date() < new Date(user.freeTrialEnds);
  
  let freeTrialInfo = null;
  
  if (hasActiveFreeTrial) {
    const daysRemaining = Math.ceil((new Date(user.freeTrialEnds) - new Date()) / (1000 * 60 * 60 * 24));
    freeTrialInfo = {
      isActive: true,
      startDate: user.freeTrialStart,
      endDate: user.freeTrialEnds,
      daysRemaining: daysRemaining,
      message: `Free trial active until ${new Date(user.freeTrialEnds).toLocaleDateString()}`
    };
    console.log(`✅ Free trial active for: ${user.email} until ${user.freeTrialEnds}`);
  } else if (hasUsedFreeTrial) {
    freeTrialInfo = {
      isActive: false,
      used: true,
      message: 'You have already used your free trial'
    };
  } else {
    freeTrialInfo = {
      isActive: false,
      used: false,
      available: true,
      message: 'You are eligible for a 7-day free trial on the Basic plan'
    };
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      freeTrial: freeTrialInfo,
      canStartFreeTrial: !hasUsedFreeTrial,
      hasActiveFreeTrial
    }
  });
});

/**
 * Handle payment webhook (for CIH, Attijari, etc.)
 * @route POST /api/subscriptions/webhook
 */
exports.handleWebhook = asyncHandler(async (req, res) => {
  const { paymentReference, userId, planId, duration, paymentMethod } = req.body;
  
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
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
  let endDate = new Date();
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
  }
  
  const subscription = new Subscription({
    user: userId,
    plan: planId,
    price,
    currency: 'MAD',
    duration,
    startDate,
    endDate,
    paymentMethod: paymentMethod || 'bank_transfer',
    paymentReference,
    status: 'active',
    paymentStatus: 'paid',
    paymentDate: new Date(),
    autoRenew: true,
    features: selectedPlan.features
  });
  
  await subscription.save();
  
  // Update user's subscription reference
  user.subscription = subscription._id;
  await user.save();
  
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
  const user = await User.findById(req.user._id);
  const hasActiveFreeTrial = user?.freeTrialUsed === true && user?.freeTrialEnds && new Date() < new Date(user.freeTrialEnds);
  
  res.status(200).json({
    status: 'success',
    data: {
      hasActiveSubscription,
      hasActiveFreeTrial,
      subscription: hasActiveSubscription ? {
        plan: subscription.plan,
        endDate: subscription.endDate,
        daysRemaining: Math.max(0, Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)))
      } : null,
      freeTrial: hasActiveFreeTrial ? {
        endDate: user.freeTrialEnds,
        daysRemaining: Math.max(0, Math.ceil((user.freeTrialEnds - new Date()) / (1000 * 60 * 60 * 24)))
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