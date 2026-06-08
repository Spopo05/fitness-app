// server.js
const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const PORT = process.env.PORT || 5000;

// Import trial checker (with error handling)
let startTrialChecker;
try {
  const trialChecker = require('./utils/trialChecker');
  startTrialChecker = trialChecker.startTrialChecker;
  console.log('✅ Trial checker loaded successfully');
} catch (error) {
  console.log('⚠️ Trial checker not loaded:', error.message);
  startTrialChecker = () => console.log('Trial checker disabled');
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    // Start the trial checker after database connection
    if (startTrialChecker) {
      startTrialChecker();
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});