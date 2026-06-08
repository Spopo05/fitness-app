const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Subscription = require('../models/subscription.model');

// Initialize Gemini only if API key exists
let GoogleGenerativeAI;
let genAI = null;
const MODEL = 'gemini-2.5-flash'; // Changed to gemini-pro which is more stable

try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
  if (process.env.GOOGLE_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    console.log('✅ Gemini AI initialized successfully');
  } else {
    console.log('❌ GOOGLE_API_KEY not found in .env file');
  }
} catch (error) {
  console.log('❌ @google/generative-ai package not installed. Run: npm install @google/generative-ai');
}

// All routes require authentication
router.use(authenticate);

// ============================================
// AI ACCESS CHECK MIDDLEWARE
// ============================================
const checkAIAccess = async (req, res, next) => {
  try {
    // Admin always has access
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user has an active subscription
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active'
    });
    
    if (!subscription) {
      return res.status(403).json({
        status: 'error',
        message: 'AI Assistant is only available for Premium and Elite subscribers. Please upgrade your plan to access this feature.',
        code: 'UPGRADE_REQUIRED'
      });
    }
    
    // Get plan details
    const plans = Subscription.getPlans();
    const plan = plans[subscription.plan];
    
    // Check if plan has AI access (Premium or Elite only)
    if (!plan || !plan.hasAIAssistant) {
      return res.status(403).json({
        status: 'error',
        message: `AI Assistant is not included in your ${subscription.plan} plan. Please upgrade to Premium or Elite to access AI features.`,
        code: 'UPGRADE_REQUIRED',
        currentPlan: subscription.plan,
        requiredPlans: ['premium', 'elite']
      });
    }
    
    // Attach subscription info for optional use
    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('AI Access check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error checking access permissions'
    });
  }
};

// ============================================
// PUBLIC ACCESS CHECK (no AI access required)
// ============================================

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ status: 'success', message: 'AI routes are working!' });
});

// Check if user has access to AI features
router.get('/check-access', async (req, res) => {
  try {
    // Admin always has access
    if (req.user.role === 'admin') {
      return res.status(200).json({
        status: 'success',
        data: {
          hasAccess: true,
          plan: 'admin',
          message: 'Admin access granted'
        }
      });
    }
    
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active'
    });
    
    if (!subscription) {
      return res.status(200).json({
        status: 'success',
        data: {
          hasAccess: false,
          plan: null,
          message: 'AI Assistant is only available for Premium and Elite subscribers.'
        }
      });
    }
    
    const plans = Subscription.getPlans();
    const plan = plans[subscription.plan];
    const hasAccess = plan?.hasAIAssistant === true;
    
    res.status(200).json({
      status: 'success',
      data: {
        hasAccess,
        plan: subscription.plan,
        message: hasAccess ? 'Access granted' : `Upgrade to Premium or Elite to access AI features.`,
        features: hasAccess ? plan?.features : null
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// ============================================
// PROTECTED AI ROUTES (require AI access)
// ============================================

// Apply AI access check to all following routes
router.use(checkAIAccess);

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    console.log('Chat request received:', message?.substring(0, 50));

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!genAI) {
      return res.status(503).json({ 
        status: 'error', 
        message: 'AI service not configured. Please check server configuration.' 
      });
    }

    const prompt = `You are FitAI, a professional fitness coach. 
    
User: ${context?.user?.name || 'Athlete'}
Goal: ${context?.user?.goals || 'General fitness'}

Question: ${message}

Give a helpful, friendly fitness response. Keep it concise. Use emojis. Be encouraging.`;

    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(prompt);
    const aiMessage = result.response.text();
    
    console.log('Gemini response sent successfully');

    res.json({
      status: 'success',
      message: aiMessage,
      suggestions: [
        'Create a workout plan for me',
        'Help with my nutrition',
        'How to stay motivated?'
      ],
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('❌ /chat error:', error.message);
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Failed to get AI response' 
    });
  }
});

// Generate workout plan
router.post('/generate-workout', async (req, res) => {
  try {
    const { goal, duration, frequency, equipment } = req.body;
    
    if (!genAI) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const prompt = `Create a ${duration}-minute workout plan for ${goal}. 
Frequency: ${frequency} days/week. Equipment: ${equipment === 'none' ? 'bodyweight only' : equipment}.

Include: warm-up, main exercises (sets/reps), cool-down, and tips. Make it practical.`;

    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(prompt);
    
    res.json({ status: 'success', message: result.response.text() });
  } catch (error) {
    console.error('❌ /generate-workout error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Generate meal plan
router.post('/generate-meal-plan', async (req, res) => {
  try {
    const { goal, calories, dietType, allergies } = req.body;
    
    if (!genAI) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const prompt = `Create a ${calories}-calorie daily meal plan for ${goal}. 
Diet: ${dietType}. Avoid: ${allergies || 'none'}.

Include: breakfast, lunch, snack, dinner, and hydration tips.`;

    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(prompt);
    
    res.json({ status: 'success', message: result.response.text() });
  } catch (error) {
    console.error('❌ /generate-meal-plan error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;