const Notification = require('../models/notification.model');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Get user's notifications
 * @route GET /api/notifications
 */
exports.getNotifications = asyncHandler(async (req, res) => {
  const { limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Notification.countDocuments({ user: req.user._id });
  const unreadCount = await Notification.countDocuments({ 
    user: req.user._id, 
    read: false 
  });

  res.status(200).json({
    status: 'success',
    data: {
      notifications,
      total,
      unreadCount,
      hasMore: skip + notifications.length < total
    }
  });
});

/**
 * Mark notification as read
 * @route PATCH /api/notifications/:id/read
 */
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  notification.read = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({
    status: 'success',
    data: { notification }
  });
});

/**
 * Mark all notifications as read
 * @route PATCH /api/notifications/read-all
 */
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true, readAt: new Date() }
  );

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read'
  });
});

/**
 * Delete notification
 * @route DELETE /api/notifications/:id
 */
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  res.status(200).json({
    status: 'success',
    message: 'Notification deleted'
  });
});

/**
 * Delete all notifications
 * @route DELETE /api/notifications
 */
exports.deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user._id });

  res.status(200).json({
    status: 'success',
    message: 'All notifications deleted'
  });
});

/**
 * Create notification (internal use - called from other controllers)
 * @param {string} userId - User ID
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} data - Additional data
 * @returns {object} - Created notification
 */
exports.createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
      read: false
    });
    
    console.log(`📧 Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Get unread count only
 * @route GET /api/notifications/unread-count
 */
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    read: false
  });

  res.status(200).json({
    status: 'success',
    data: { unreadCount }
  });
});