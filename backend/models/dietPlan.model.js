const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  calories: {
    type: Number
  },
  protein: {
    type: Number
  },
  carbs: {
    type: Number
  },
  fat: {
    type: Number
  },
  foods: [{
    name: String,
    quantity: String,
    calories: Number
  }]
});

const dietPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  targetCalories: {
    type: Number
  },
  macroSplit: {
    protein: Number,
    carbs: Number,
    fat: Number
  },
  meals: [mealSchema],
  notes: {
    type: String
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
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

// Method to check if plan is expired
dietPlanSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to check if plan is active and not expired and not completed
dietPlanSchema.methods.isValid = function() {
  return this.isActive && !this.isExpired() && !this.isCompleted;
};

// Method to check if plan is available for user
dietPlanSchema.methods.isAvailable = function() {
  return !this.isCompleted && !this.isExpired();
};

// Virtual for checking if plan is still valid
dietPlanSchema.virtual('status').get(function() {
  if (this.isCompleted) return 'completed';
  if (this.isExpired()) return 'expired';
  if (!this.isActive) return 'inactive';
  return 'active';
});

// Virtual for calculating total daily calories
dietPlanSchema.virtual('totalCalories').get(function() {
  return this.meals.reduce((total, meal) => total + (meal.calories || 0), 0);
});

// Virtual for calculating total macros
dietPlanSchema.virtual('totalMacros').get(function() {
  return {
    protein: this.meals.reduce((total, meal) => total + (meal.protein || 0), 0),
    carbs: this.meals.reduce((total, meal) => total + (meal.carbs || 0), 0),
    fat: this.meals.reduce((total, meal) => total + (meal.fat || 0), 0)
  };
});

// Virtual for hours until expiration
dietPlanSchema.virtual('hoursUntilExpiration').get(function() {
  if (this.isExpired()) return 0;
  const diffMs = this.expiresAt - new Date();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
});

// Auto-expire query helper - get only active plans
dietPlanSchema.statics.getActivePlans = function(userId) {
  return this.find({
    user: userId,
    isActive: true,
    isCompleted: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Auto-expire query helper - get completed plans
dietPlanSchema.statics.getCompletedPlans = function(userId) {
  return this.find({
    user: userId,
    isCompleted: true
  }).sort({ completedAt: -1 });
};

// Auto-expire query helper - get expired plans
dietPlanSchema.statics.getExpiredPlans = function(userId) {
  return this.find({
    user: userId,
    isActive: true,
    isCompleted: false,
    expiresAt: { $lte: new Date() }
  }).sort({ expiresAt: -1 });
};

// Pre-save middleware to update timestamps
dietPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-save middleware to auto-expire when completed
dietPlanSchema.pre('save', function(next) {
  if (this.isCompleted && !this.completedAt) {
    this.completedAt = new Date();
    this.isActive = false;
  }
  next();
});

// Enable virtuals when converting to JSON
dietPlanSchema.set('toJSON', { virtuals: true });
dietPlanSchema.set('toObject', { virtuals: true });

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);

module.exports = DietPlan;