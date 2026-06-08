// backend/models/contact.model.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  subject: {
    type: String,
    default: '',
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userRole: {
    type: String,
    enum: ['user', 'coach', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['pending', 'read', 'replied', 'resolved'],
    default: 'pending'
  },
  adminNote: {
    type: String,
    default: ''
  },
  repliedAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true 
});

contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ userId: 1 });

module.exports = mongoose.model('Contact', contactSchema);