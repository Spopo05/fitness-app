const express = require('express');
const { body, param } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const messageController = require('../controllers/message.controller');
const { authenticate, requireActiveSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

// Create upload directories
const createDirs = () => {
  const dirs = [
    'uploads/messages/images',
    'uploads/messages/videos',
    'uploads/messages/audio'
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};
createDirs();

// ============================================
// CONFIGURE STORAGE FOR ALL MEDIA TYPES
// ============================================

// Audio storage
const audioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/messages/audio/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + '.webm');
  }
});

const audioFilter = (req, file, cb) => {
  const allowedTypes = /audio\/webm|audio\/mp3|audio\/ogg|audio\/wav/;
  if (allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed'), false);
  }
};

// Image storage
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/messages/images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  if (allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'), false);
  }
};

// Video storage
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/messages/videos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|mov|avi|mkv|webm|quicktime/;
  if (allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only videos are allowed'), false);
  }
};

// ============================================
// CREATE MULTER INSTANCES
// ============================================

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: audioFilter
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: videoFilter
});

// Message validation
const messageValidation = [
  body('recipientId').isMongoId().withMessage('Invalid recipient ID'),
  body('content').optional(),
];

// ============================================
// ROUTES
// ============================================

// Unread count doesn't require subscription
router.get('/unread/count', authenticate, messageController.getUnreadCount);

// Apply authentication and subscription to other routes
router.use(authenticate);
router.use(requireActiveSubscription);

// Send text message
router.post('/send', messageValidation, validate, messageController.sendMessage);

// Send voice message
router.post('/send-voice', uploadAudio.single('audio'), messageController.sendVoiceMessage);

// Send image message
router.post('/send-image', uploadImage.single('image'), messageController.sendImageMessage);

// Send video message
router.post('/send-video', uploadVideo.single('video'), messageController.sendVideoMessage);

// Get all conversations
router.get('/conversations', messageController.getConversations);

// Get conversation messages
router.get('/conversation/:userId', 
  [param('userId').isMongoId()], 
  validate, 
  messageController.getConversationMessages
);

// Delete entire conversation
router.delete('/conversation/:userId',
  [param('userId').isMongoId()],
  validate,
  messageController.deleteConversation
);

// Mark message as read
router.patch('/:messageId/read', 
  [param('messageId').isMongoId()], 
  validate, 
  messageController.markAsRead
);

// Delete a single message
router.delete('/:messageId',
  [param('messageId').isMongoId()],
  validate,
  messageController.deleteMessage
);

module.exports = router;