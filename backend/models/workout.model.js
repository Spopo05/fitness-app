const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sets: {
    type: Number,
    required: true
  },
  reps: {
    type: String,
    required: true
  },
  weight: {
    type: String
  },
  restTime: {
    type: String
  },
  notes: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const workoutSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'hiit', 'recovery', 'custom'],
    default: 'custom'
  },
  duration: {
    type: Number, // in minutes
  },
  targetMuscleGroups: [{
    type: String,
    enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body']
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  exercises: [exerciseSchema],
  scheduledDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'missed'],
    default: 'scheduled'
  },
  notes: {
    type: String
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

// Virtual for completion percentage
workoutSchema.virtual('completionPercentage').get(function() {
  if (!this.exercises.length) return 0;
  
  const completedExercises = this.exercises.filter(ex => ex.completed).length;
  return Math.round((completedExercises / this.exercises.length) * 100);
});

// Method to mark workout as completed
workoutSchema.methods.markAsCompleted = async function() {
  this.status = 'completed';
  this.completedDate = new Date();
  await this.save();
  return this;
};

// Enable virtuals
workoutSchema.set('toJSON', { virtuals: true });
workoutSchema.set('toObject', { virtuals: true });

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;