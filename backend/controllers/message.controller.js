const Message = require('../models/message.model');
const User = require('../models/user.model');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const notificationController = require('./notification.controller');

/**
 * Get count of unread messages for the logged-in user
 */
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({
    recipient: req.user._id,
    read: false,
    deletedForRecipient: { $ne: true },
  });

  res.status(200).json({
    status: 'success',
    data: { unreadCount: count },
  });
});

/**
 * Send a text message
 */
exports.sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content } = req.body;

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new AppError('Recipient not found', 404);
  }

  const message = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    content,
    type: 'text',
    read: false,
    createdAt: new Date(),
    deletedForSender: false,
    deletedForRecipient: false,
  });

  await message.populate('sender', 'name profilePicture');

  // Send notification to recipient
  await notificationController.createNotification(
    recipientId,
    'message',
    'New Message',
    `${req.user.name} sent you a message`,
    { messageId: message._id, senderId: req.user._id }
  );

  res.status(201).json({
    status: 'success',
    data: { message },
  });
});

/**
 * Send an image message
 */
exports.sendImageMessage = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;
  
  if (!req.file) {
    throw new AppError('No image file uploaded', 400);
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new AppError('Recipient not found', 404);
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const imageUrl = `${baseUrl}/uploads/messages/images/${req.file.filename}`;
  
  // Create thumbnail
  let thumbnailUrl = '';
  try {
    const thumbnailFilename = 'thumb-' + req.file.filename;
    const thumbnailPath = path.join(__dirname, '../uploads/messages/images/', thumbnailFilename);
    
    await sharp(req.file.path)
      .resize(200, 200, { fit: 'inside' })
      .toFile(thumbnailPath);
    
    thumbnailUrl = `${baseUrl}/uploads/messages/images/${thumbnailFilename}`;
  } catch (err) {
    console.error('Thumbnail creation failed:', err);
  }

  const message = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    content: '📷 Image',
    type: 'image',
    mediaUrl: imageUrl,
    thumbnailUrl,
    read: false,
    createdAt: new Date(),
    deletedForSender: false,
    deletedForRecipient: false,
  });

  await message.populate('sender', 'name profilePicture');

  // Send notification to recipient
  await notificationController.createNotification(
    recipientId,
    'message',
    'New Image',
    `${req.user.name} sent you an image`,
    { messageId: message._id, senderId: req.user._id, type: 'image' }
  );

  res.status(201).json({
    status: 'success',
    data: { message },
  });
});

/**
 * Send a video message
 */
exports.sendVideoMessage = asyncHandler(async (req, res) => {
  const { recipientId, duration } = req.body;
  
  if (!req.file) {
    throw new AppError('No video file uploaded', 400);
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new AppError('Recipient not found', 404);
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const videoUrl = `${baseUrl}/uploads/messages/videos/${req.file.filename}`;

  const message = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    content: '🎥 Video',
    type: 'video',
    mediaUrl: videoUrl,
    duration: parseInt(duration) || 0,
    read: false,
    createdAt: new Date(),
    deletedForSender: false,
    deletedForRecipient: false,
  });

  await message.populate('sender', 'name profilePicture');

  // Send notification to recipient
  await notificationController.createNotification(
    recipientId,
    'message',
    'New Video',
    `${req.user.name} sent you a video`,
    { messageId: message._id, senderId: req.user._id, type: 'video' }
  );

  res.status(201).json({
    status: 'success',
    data: { message },
  });
});

/**
 * Send a voice message
 */
exports.sendVoiceMessage = asyncHandler(async (req, res) => {
  const { recipientId, duration } = req.body;
  
  if (!req.file) {
    throw new AppError('No audio file uploaded', 400);
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new AppError('Recipient not found', 404);
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const audioUrl = `${baseUrl}/uploads/messages/audio/${req.file.filename}`;

  const message = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    content: '🎤 Voice message',
    type: 'voice',
    mediaUrl: audioUrl,
    duration: parseInt(duration) || 0,
    read: false,
    createdAt: new Date(),
    deletedForSender: false,
    deletedForRecipient: false,
  });

  await message.populate('sender', 'name profilePicture');

  // Send notification to recipient
  await notificationController.createNotification(
    recipientId,
    'message',
    'New Voice Message',
    `${req.user.name} sent you a voice message`,
    { messageId: message._id, senderId: req.user._id, type: 'voice', duration: parseInt(duration) || 0 }
  );

  res.status(201).json({
    status: 'success',
    data: { message },
  });
});

/**
 * Add emoji to message
 */
exports.addEmojiToMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new AppError('Message not found', 404);
  }

  if (message.sender.toString() !== userId.toString() && 
      message.recipient.toString() !== userId.toString()) {
    throw new AppError('Not authorized', 403);
  }

  if (!message.emojis) {
    message.emojis = [];
  }
  
  if (!message.emojis.includes(emoji)) {
    message.emojis.push(emoji);
    await message.save();
  }

  res.status(200).json({
    status: 'success',
    data: { message },
  });
});

/**
 * Remove emoji from message
 */
exports.removeEmojiFromMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new AppError('Message not found', 404);
  }

  if (message.sender.toString() !== userId.toString() && 
      message.recipient.toString() !== userId.toString()) {
    throw new AppError('Not authorized', 403);
  }

  message.emojis = message.emojis.filter(e => e !== emoji);
  await message.save();

  res.status(200).json({
    status: 'success',
    data: { message },
  });
});

/**
 * Get conversations
 */
exports.getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: userId, deletedForSender: { $ne: true } },
          { recipient: userId, deletedForRecipient: { $ne: true } },
        ],
      },
    },
    {
      $project: {
        conversationUser: {
          $cond: [{ $eq: ['$sender', userId] }, '$recipient', '$sender'],
        },
        createdAt: 1,
        content: 1,
        type: 1,
        mediaUrl: 1,
        read: {
          $cond: [{ $eq: ['$recipient', userId] }, '$read', true],
        },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: '$conversationUser',
        lastMessage: { $first: '$content' },
        lastMessageType: { $first: '$type' },
        lastMessageDate: { $first: '$createdAt' },
        lastMessageMedia: { $first: '$mediaUrl' },
        unreadCount: {
          $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        username: { $ifNull: ['$user.name', '$user.email'] },
        userEmail: '$user.email',
        userProfilePicture: '$user.profilePicture',
        lastMessage: {
          $switch: {
            branches: [
              { case: { $eq: ['$lastMessageType', 'image'] }, then: '📷 Image' },
              { case: { $eq: ['$lastMessageType', 'video'] }, then: '🎥 Video' },
              { case: { $eq: ['$lastMessageType', 'voice'] }, then: '🎤 Voice message' },
            ],
            default: '$lastMessage'
          }
        },
        lastMessageDate: 1,
        unreadCount: 1,
      },
    },
    {
      $sort: { lastMessageDate: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: { conversations },
  });
});

/**
 * Get conversation messages
 */
exports.getConversationMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const otherUserId = req.params.userId;

  const otherUser = await User.findById(otherUserId);
  if (!otherUser) {
    throw new AppError('User not found', 404);
  }

  const messages = await Message.find({
    $or: [
      { sender: userId, recipient: otherUserId, deletedForSender: { $ne: true } },
      { sender: otherUserId, recipient: userId, deletedForRecipient: { $ne: true } },
    ],
  })
    .sort({ createdAt: 1 })
    .populate('sender', 'name profilePicture')
    .populate('recipient', 'name profilePicture')
    .lean();

  await Message.updateMany(
    {
      sender: otherUserId,
      recipient: userId,
      read: false,
    },
    { $set: { read: true, readAt: new Date() } }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        _id: otherUser._id,
        name: otherUser.name,
        email: otherUser.email,
        profilePicture: otherUser.profilePicture,
        role: otherUser.role,
      },
      messages,
    },
  });
});

/**
 * Delete conversation
 */
exports.deleteConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const otherUserId = req.params.userId;

  await Message.updateMany(
    { sender: userId, recipient: otherUserId },
    { $set: { deletedForSender: true } }
  );

  await Message.updateMany(
    { sender: otherUserId, recipient: userId },
    { $set: { deletedForRecipient: true } }
  );

  res.status(200).json({
    status: 'success',
    message: 'Conversation deleted successfully',
  });
});

/**
 * Mark message as read
 */
exports.markAsRead = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new AppError('Message not found', 404);
  }

  if (message.recipient.toString() !== userId.toString()) {
    throw new AppError('Not authorized', 403);
  }

  message.read = true;
  message.readAt = new Date();
  await message.save();

  res.status(200).json({
    status: 'success',
    data: { message },
  });
});

/**
 * Delete single message
 */
exports.deleteMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new AppError('Message not found', 404);
  }

  if (message.sender.toString() === userId.toString()) {
    await Message.findByIdAndUpdate(messageId, { deletedForSender: true });
  } else if (message.recipient.toString() === userId.toString()) {
    await Message.findByIdAndUpdate(messageId, { deletedForRecipient: true });
  } else {
    throw new AppError('Not authorized', 403);
  }

  res.status(200).json({
    status: 'success',
    message: 'Message deleted successfully',
  });
});