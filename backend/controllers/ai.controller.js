const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const MODEL = 'gemini-2.5-flash';// ✅ Fixed
const requestCount = { count: 0, resetTime: Date.now() + 86400000 };

const checkLimit = () => {
  if (Date.now() > requestCount.resetTime) {
    requestCount.count = 0;
    requestCount.resetTime = Date.now() + 86400000;
  }
  if (requestCount.count >= 1400) { // stop at 1400 to be safe
    throw new Error('Daily AI limit reached. Please try again tomorrow.');
  }
  requestCount.count++;
};

exports.chat = asyncHandler(async (req, res) => {
  const { message, context } = req.body;

  if (!message) {
    throw new AppError('Message is required', 400);
  }

  const prompt = `You are FitAI, a professional fitness coach.

User: ${context?.user?.name || 'Athlete'}
Goal: ${context?.user?.goals || 'General fitness'}
Weight: ${context?.user?.weight || 'Unknown'} kg
Height: ${context?.user?.height || 'Unknown'} cm

User question: ${message}

Give a helpful, encouraging response. Keep it concise (2-3 paragraphs). Use emojis. Be practical.`;

  const model = genAI.getGenerativeModel({ model: MODEL }); // ✅ Fixed
  const result = await model.generateContent(prompt);

  res.status(200).json({
    status: 'success',
    message: result.response.text(),
    suggestions: ['Create workout plan', 'Nutrition help', 'Motivation tips'],
    timestamp: new Date()
  }
);

});

exports.generateWorkout = asyncHandler(async (req, res) => {
  const { goal, duration, frequency, equipment } = req.body;

  const prompt = `Create a ${duration}-minute workout plan for ${goal}. 
Frequency: ${frequency} days/week. Equipment: ${equipment || 'bodyweight'}.

Include: warm-up, exercises with sets/reps, cool-down, and tips.`;

  const model = genAI.getGenerativeModel({ model: MODEL }); // ✅ Fixed
  const result = await model.generateContent(prompt);

  res.status(200).json({
    status: 'success',
    message: result.response.text()
  });
});

exports.generateMealPlan = asyncHandler(async (req, res) => {
  const { goal, calories, dietType, allergies } = req.body;

  const prompt = `Create a ${calories}-calorie daily meal plan for ${goal}. 
Diet: ${dietType}. Avoid: ${allergies || 'none'}.

Include breakfast, lunch, snack, dinner.`;

  const model = genAI.getGenerativeModel({ model: MODEL }); // ✅ Fixed
  const result = await model.generateContent(prompt);

  res.status(200).json({
    status: 'success',
    message: result.response.text()
  });
});

exports.getFitnessTips = asyncHandler(async (req, res) => {
  const model = genAI.getGenerativeModel({ model: MODEL }); // ✅ Fixed
  const result = await model.generateContent('Give 5 quick fitness tips for beginners');

  res.status(200).json({
    status: 'success',
    data: { tips: result.response.text() }
  });
});
