// backend/utils/trialChecker.js
const cron = require('node-cron');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

// Run every day at 9 AM
const checkExpiringTrials = async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    // Trials ending tomorrow
    const endingTomorrow = await User.find({
      freeTrialEnds: { $gte: now, $lt: tomorrow },
      freeTrialUsed: true,
      role: 'user'
    }).select('name email freeTrialEnds');
    
    // Trials ending in 3 days
    const endingIn3Days = await User.find({
      freeTrialEnds: { $gt: now, $lt: threeDaysFromNow },
      freeTrialUsed: true,
      role: 'user'
    }).select('name email freeTrialEnds');
    
    // Send notifications to users
    for (const user of endingTomorrow) {
      const daysLeft = Math.ceil((user.freeTrialEnds - now) / (1000 * 60 * 60 * 24));
      await Notification.create({
        user: user._id,
        type: 'subscription_expiring',
        title: '⚠️ Your Free Trial Ends Tomorrow!',
        message: `Your free trial ends tomorrow. Subscribe now to continue enjoying premium features!`,
        data: {
          trialEnds: user.freeTrialEnds,
          daysLeft
        }
      });
    }
    
    for (const user of endingIn3Days) {
      const daysLeft = Math.ceil((user.freeTrialEnds - now) / (1000 * 60 * 60 * 24));
      await Notification.create({
        user: user._id,
        type: 'subscription_expiring',
        title: '⏰ Your Free Trial is Ending Soon!',
        message: `Your free trial ends in ${daysLeft} days. Subscribe now to continue your fitness journey!`,
        data: {
          trialEnds: user.freeTrialEnds,
          daysLeft
        }
      });
    }
    
    console.log(`✅ Checked expiring trials: ${endingTomorrow.length} ending tomorrow, ${endingIn3Days.length} ending in 3 days`);
    
    // Also create notifications for admin
    if (endingTomorrow.length > 0 || endingIn3Days.length > 0) {
      const adminUsers = await User.find({ role: 'admin' }).select('_id');
      
      for (const admin of adminUsers) {
        await Notification.create({
          user: admin._id,
          type: 'reminder',
          title: '📊 Free Trial Report',
          message: `${endingIn3Days.length} users have trials ending in 3 days. ${endingTomorrow.length} users have trials ending tomorrow.`,
          data: {
            endingTomorrow: endingTomorrow.length,
            endingIn3Days: endingIn3Days.length,
            users: endingIn3Days.map(u => ({ name: u.name, email: u.email, ends: u.freeTrialEnds }))
          }
        });
      }
    }
    
  } catch (error) {
    console.error('Error checking expiring trials:', error);
  }
};

// Schedule the job to run daily at 9 AM
const startTrialChecker = () => {
  try {
    cron.schedule('0 9 * * *', () => {
      console.log('🔄 Running free trial checker...');
      checkExpiringTrials();
    });
    console.log('✅ Free trial checker scheduled (daily at 9 AM)');
  } catch (error) {
    console.error('Failed to schedule trial checker:', error);
  }
};

// Simple function to run once (for testing)
const runOnce = async () => {
  console.log('🔄 Running trial checker once...');
  await checkExpiringTrials();
  console.log('✅ Trial checker completed');
};

module.exports = { checkExpiringTrials, startTrialChecker, runOnce };