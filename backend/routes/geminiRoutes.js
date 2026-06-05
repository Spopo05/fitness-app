const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Initialize Gemini only if API key exists
let GoogleGenerativeAI;
let genAI = null;
const MODEL = 'gemini-2.5-flash';// ✅ Fixed model name

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

router.use(authenticate);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ status: 'success', message: 'AI routes are working!' });
});

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

    const model = genAI.getGenerativeModel({ model: MODEL }); // ✅ Fixed
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

    const model = genAI.getGenerativeModel({ model: MODEL }); // ✅ Fixed
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

    const model = genAI.getGenerativeModel({ model: MODEL }); // ✅ Fixed
    const result = await model.generateContent(prompt);
    
    res.json({ status: 'success', message: result.response.text() });
  } catch (error) {
    console.error('❌ /generate-meal-plan error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;