const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['text', 'voice', 'image', 'video'],
    default: 'text'
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 0
  },
  emojis: [{
    type: String
  }],
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  deletedForSender: {
    type: Boolean,
    default: false
  },
  deletedForRecipient: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ sender: 1, deletedForSender: 1 });
messageSchema.index({ recipient: 1, deletedForRecipient: 1 });
messageSchema.index({ recipient: 1, read: 1, deletedForRecipient: 1 });

// Static method to get conversation
messageSchema.statics.getConversation = async function(user1Id, user2Id, options = {}) {
  const { limit = 20, skip = 0 } = options;
  
  return this.find({
    $or: [
      { sender: user1Id, recipient: user2Id, deletedForSender: { $ne: true } },
      { sender: user2Id, recipient: user1Id, deletedForRecipient: { $ne: true } }
    ]
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name profilePicture')
    .populate('recipient', 'name profilePicture');
};

// Mark message as read
messageSchema.methods.markAsRead = async function() {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
    await this.save();
  }
  return this;
};

// Soft delete for user
messageSchema.methods.softDeleteForUser = async function(userId) {
  if (this.sender.toString() === userId.toString()) {
    this.deletedForSender = true;
  } else if (this.recipient.toString() === userId.toString()) {
    this.deletedForRecipient = true;
  }
  await this.save();
  return this;
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;