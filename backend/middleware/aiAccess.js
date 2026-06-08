const Subscription = require('../models/subscription.model');

/**
 * Check if user has access to AI features
 * Only Premium and Elite subscribers (and admins) have access
 */
exports.checkAIAccess = async (req, res, next) => {
  try {
    // Admin always has access
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user has an active subscription
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active'
    });
    
    if (!subscription) {
      return res.status(403).json({
        status: 'error',
        message: 'AI Assistant is only available for Premium and Elite subscribers. Please upgrade your plan to access this feature.'
      });
    }
    
    // Check if subscription plan includes AI access
    const plans = Subscription.getPlans();
    const plan = plans[subscription.plan];
    
    if (!plan || !plan.hasAIAssistant) {
      return res.status(403).json({
        status: 'error',
        message: `AI Assistant is not included in your ${subscription.plan} plan. Please upgrade to Premium or Elite to access AI features.`
      });
    }
    
    // Attach subscription info to request for optional use
    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('AI Access check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error checking access permissions'
    });
  }
};

/**
 * Get AI access status for current user
 */
exports.getAIAccessStatus = async (req, res) => {
  try {
    // Admin always has access
    if (req.user.role === 'admin') {
      return res.status(200).json({
        status: 'success',
        data: {
          hasAccess: true,
          plan: 'admin',
          message: 'Admin access granted'
        }
      });
    }
    
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active'
    });
    
    if (!subscription) {
      return res.status(200).json({
        status: 'success',
        data: {
          hasAccess: false,
          plan: null,
          message: 'AI Assistant is only available for Premium and Elite subscribers.'
        }
      });
    }
    
    const plans = Subscription.getPlans();
    const plan = plans[subscription.plan];
    const hasAccess = plan?.hasAIAssistant === true;
    
    res.status(200).json({
      status: 'success',
      data: {
        hasAccess,
        plan: subscription.plan,
        message: hasAccess ? 'Access granted' : `Upgrade to Premium or Elite to access AI features.`
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};