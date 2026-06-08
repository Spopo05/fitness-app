const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'coach', 'admin'],
    default: 'user'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  weightHistory: [{
    weight: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  height: {
    type: Number
  },
  goals: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'maintenance', 'general_fitness'],
    default: 'general_fitness'
  },
  dietPlans: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DietPlan'
  }],
  // COACH PROFILE FIELDS
  bio: {
    type: String,
    default: ''
  },
  specialty: {
    type: String,
    default: ''
  },
  certifications: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    default: ''
  },
  successRate: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  linkedin: {
    type: String,
    default: ''
  },
  instagram: {
    type: String,
    default: ''
  },
  facebook: {
    type: String,
    default: ''
  },
  twitter: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  // ✅ Free trial
  freeTrialStart: {
    type: Date,
    default: null
  },
  freeTrialEnds: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  freeTrialUsed: {
    type: Boolean,
    default: false
  },
  // Password reset
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(config.SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get user profile
userSchema.methods.getProfile = function() {
  const profile = this.toObject();
  delete profile.password;
  return profile;
};

// ✅ Method to check if free trial is active
userSchema.methods.isInFreeTrial = function() {
  return this.freeTrialEnds && new Date() < new Date(this.freeTrialEnds);
};

const User = mongoose.model('User', userSchema);

module.exports = User;