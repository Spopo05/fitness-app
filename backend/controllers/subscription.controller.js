const Subscription = require('../models/subscription.model');
const User = require('../models/user.model');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Get available subscription plans
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
        daysRemaining: Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24))
      }
    }
  });
});

/**
 * Create new subscription
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
    features: selectedPlan.features
  });
  
  subscription.endDate = subscription.calculateEndDate();
  await subscription.save();
  
  // Update user's subscription reference
  await User.findByIdAndUpdate(req.user._id, { subscription: subscription._id });
  
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
        formattedPrice: sub.formattedPrice()
      }))
    }
  });
});

/**
 * Handle payment webhook (for CIH, Attijari, etc.)
 */
exports.handleWebhook = asyncHandler(async (req, res) => {
  const { paymentReference, userId, planId, duration } = req.body;
  
  // Verify payment with bank API (implement based on your payment provider)
  // This is a placeholder for actual payment verification
  
  const plans = Subscription.getPlans();
  const selectedPlan = plans[planId];
  const price = selectedPlan.price[duration];
  
  const subscription = new Subscription({
    user: userId,
    plan: planId,
    price,
    currency: 'MAD',
    duration,
    startDate: new Date(),
    endDate: new Date(),
    paymentMethod: req.body.paymentMethod || 'bank_transfer',
    paymentReference,
    status: 'active',
    features: selectedPlan.features
  });
  
  subscription.endDate = subscription.calculateEndDate();
  await subscription.save();
  
  await User.findByIdAndUpdate(userId, { subscription: subscription._id });
  
  res.status(200).json({
    status: 'success',
    message: 'Subscription activated'
  });
});