const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['basic', 'pro', 'premium', 'elite'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'MAD'
  },
  duration: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'cash', 'cih', 'attijari', 'bmce'],
    required: true
  },
  paymentReference: {
    type: String,
    default: ''
  },
  paymentDate: {
    type: Date
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  features: [{
    type: String
  }],
  cancelledAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Plan configurations in MAD (Moroccan Dirham)
subscriptionSchema.statics.getPlans = function() {
  return {
    basic: {
      name: 'Basic',
      price: {
        monthly: 49,
        quarterly: 129,
        yearly: 499
      },
      features: [
        'Access to basic workouts',
        'Basic diet plans',
        'Email support',
        'Progress tracking'
      ],
      hasAIAssistant: false,
      color: 'gray'
    },
    pro: {
      name: 'Pro',
      price: {
        monthly: 99,
        quarterly: 269,
        yearly: 999
      },
      features: [
        'All Basic features',
        'Advanced workouts',
        'Personalized diet plans',
        'Priority support',
        'Video coaching calls',
        'Monthly progress reports'
      ],
      hasAIAssistant: false,
      color: 'blue'
    },
    premium: {
      name: 'Premium',
      price: {
        monthly: 149,
        quarterly: 399,
        yearly: 1499
      },
      features: [
        'All Pro features',
        '1-on-1 coaching',
        'Custom meal plans',
        'Weekly check-ins',
        'Unlimited messaging with coach',
        'Access to exclusive content'
      ],
      hasAIAssistant: true,
      color: 'yellow'
    },
    elite: {
      name: 'Elite',
      price: {
        monthly: 249,
        quarterly: 699,
        yearly: 2499
      },
      features: [
        'All Premium features',
        'Dedicated coach',
        'In-person sessions',
        'Nutritionist consultation',
        '24/7 priority support',
        'Free merchandise',
        'VIP event access'
      ],
      hasAIAssistant: true,
      color: 'purple'
    }
  };
};

// Calculate end date based on start date and duration
subscriptionSchema.methods.calculateEndDate = function() {
  const endDate = new Date(this.startDate);
  switch (this.duration) {
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
  return endDate;
};

// Check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && new Date() < this.endDate;
};

// Format price with MAD currency
subscriptionSchema.methods.formattedPrice = function() {
  return `${this.price} MAD`;
};

// Check if subscription has AI access
subscriptionSchema.methods.hasAIAccess = function() {
  if (!this.isActive()) return false;
  const plans = this.constructor.getPlans();
  return plans[this.plan]?.hasAIAssistant === true;
};

// Get plan details
subscriptionSchema.methods.getPlanDetails = function() {
  const plans = this.constructor.getPlans();
  return plans[this.plan];
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;