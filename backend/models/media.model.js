// backend/models/media.model.js
const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  title: {
    type: String,
    default: '',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  size: {
    type: Number,
    default: 0
  },
  mimeType: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

mediaSchema.index({ coach: 1, createdAt: -1 });

module.exports = mongoose.model('Media', mediaSchema);