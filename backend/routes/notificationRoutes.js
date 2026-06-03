const express = require('express');
const { authenticate } = require('../middleware/auth');
const notificationController = require('../controllers/notification.controller');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get notifications
router.get('/', notificationController.getNotifications);

// Mark all as read
router.patch('/read-all', notificationController.markAllAsRead);

// Delete all
router.delete('/', notificationController.deleteAllNotifications);

// Single notification operations
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;