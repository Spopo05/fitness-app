const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directories if they don't exist
const createDirectories = () => {
  const dirs = [
    'uploads/profiles',
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

createDirectories();

// Configure storage for profile pictures
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for images
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/messages/images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for videos
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/messages/videos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for audio
const audioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/messages/audio/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + '.webm');
  }
});

// File filters
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|mov|avi|mkv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (mp4, mov, avi, mkv, webm)'));
  }
};

const audioFilter = (req, file, cb) => {
  const allowedTypes = /audio\/webm|audio\/mp3|audio\/ogg|audio\/wav/;
  if (allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed'));
  }
};

// Create multer upload instances
const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
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

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: audioFilter
});

const upload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
});

module.exports = {
  upload,
  uploadProfile,
  uploadImage,
  uploadVideo,
  uploadAudio,
  single: upload.single.bind(upload),
  profileSingle: uploadProfile.single.bind(uploadProfile),
  imageSingle: uploadImage.single.bind(uploadImage),
  videoSingle: uploadVideo.single.bind(uploadVideo),
  audioSingle: uploadAudio.single.bind(uploadAudio)
};