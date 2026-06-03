const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');



// Load .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use('/uploads', express.static('uploads'));
// Middleware
app.use(cors());
app.use(express.json());

// Check if MongoDB URI is present
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env file');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Route imports
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes'); // ✅ Your missing one
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const dietPlanRoutes = require('./routes/dietPlanRoutes');
const coachRoutes = require('./routes/coachRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);  
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes); // ✅ Mount workout routes correctly
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/diet-plans', dietPlanRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/notifications', notificationRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('🏋️‍♂️ Fitness API is running...');
});

module.exports = app;
