import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { 
  Bot, Sparkles, Send, Dumbbell, Apple, Target, 
  MessageCircle, Brain, Heart, Clock, Calendar, 
  TrendingUp, Award, Zap, ChevronRight, Loader2,
  ThumbsUp, ThumbsDown, RefreshCw, Save, Share2,
  BarChart3, Activity, Flame, Crown, Star, Shield,
  Diamond, Gem
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'

const AIAssistant = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [conversation, setConversation] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [savedRecommendations, setSavedRecommendations] = useState([])
  const [workoutPreferences, setWorkoutPreferences] = useState({
    goal: 'muscle_gain',
    duration: '30',
    frequency: '3',
    equipment: 'none'
  })
  const [mealPreferences, setMealPreferences] = useState({
    goal: 'muscle_gain',
    calories: '2000',
    dietType: 'omnivore',
    allergies: ''
  })
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [showMealForm, setShowMealForm] = useState(false)

  const isRTL = i18n.language === 'ar'
  const isFrench = i18n.language === 'fr'

  const getText = (en, fr, ar) => {
    if (isFrench) return fr
    if (isRTL) return ar
    return en
  }

  // Check AI access (Premium or Elite only)
  const { data: accessData, isLoading: accessLoading } = useQuery({
    queryKey: ['aiAccess'],
    queryFn: async () => {
      try {
        const response = await api.get('/ai/check-access')
        return response.data.data
      } catch (error) {
        return { hasAccess: false, plan: null }
      }
    },
    retry: false
  })

  // Fetch user data for AI context
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        const response = await api.get('/auth/me')
        return response.data.data?.user || response.data.user
      } catch (error) {
        console.error('Error fetching user:', error)
        return null
      }
    },
    enabled: accessData?.hasAccess === true
  })

  // Fetch weight history
  const { data: weightHistory } = useQuery({
    queryKey: ['weightHistory'],
    queryFn: async () => {
      try {
        const response = await api.get('/users/weight')
        return response.data.data.weightHistory
      } catch {
        return []
      }
    },
    enabled: accessData?.hasAccess === true && !!userData
  })

  // Fetch upcoming workouts
  const { data: workouts } = useQuery({
    queryKey: ['upcomingWorkouts'],
    queryFn: async () => {
      try {
        const response = await api.get('/users/workouts/upcoming?limit=5')
        return response.data.data.workouts
      } catch {
        return []
      }
    },
    enabled: accessData?.hasAccess === true && !!userData
  })

  // Fetch current diet plan
  const { data: dietPlan } = useQuery({
    queryKey: ['currentDietPlan'],
    queryFn: async () => {
      try {
        const response = await api.get('/users/diet-plan/current')
        return response.data.data.dietPlan
      } catch {
        return null
      }
    },
    enabled: accessData?.hasAccess === true && !!userData
  })

  // AI Chat Mutation
  const chatMutation = useMutation({
    mutationFn: async ({ message, context }) => {
      const response = await api.post('/ai/chat', { message, context })
      return response.data
    },
    onSuccess: (data) => {
      setConversation(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: data.message, 
          suggestions: data.suggestions || [
            getText('Create a workout plan for me', 'Créez un plan d\'entraînement pour moi', 'قم بإنشاء خطة تمرين لي'),
            getText('Help with my nutrition', 'Aide-moi avec ma nutrition', 'ساعدني في التغذية'),
            getText('How to stay motivated?', 'Comment rester motivé ?', 'كيف أبقى متحفزاً?')
          ],
          timestamp: new Date() 
        }
      ])
      setIsTyping(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || getText('Failed to get response', 'Échec de la réponse', 'فشل في الحصول على رد'))
      setIsTyping(false)
    }
  })

  // Generate workout plan mutation
  const generateWorkoutMutation = useMutation({
    mutationFn: async (preferences) => {
      const response = await api.post('/ai/generate-workout', preferences)
      return response.data
    },
    onSuccess: (data) => {
      setSavedRecommendations(prev => [...prev, { 
        type: 'workout', 
        message: data.message, 
        preferences: workoutPreferences,
        savedAt: new Date() 
      }])
      toast.success(getText('Workout plan generated!', 'Plan d\'entraînement généré !', 'تم إنشاء خطة التمرين!'))
      setShowWorkoutForm(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || getText('Failed to generate workout', 'Échec de la génération', 'فشل في إنشاء التمرين'))
    }
  })

  // Generate meal plan mutation
  const generateMealMutation = useMutation({
    mutationFn: async (preferences) => {
      const response = await api.post('/ai/generate-meal-plan', preferences)
      return response.data
    },
    onSuccess: (data) => {
      setSavedRecommendations(prev => [...prev, { 
        type: 'meal', 
        message: data.message, 
        preferences: mealPreferences,
        savedAt: new Date() 
      }])
      toast.success(getText('Meal plan generated!', 'Plan de repas généré !', 'تم إنشاء خطة الوجبات!'))
      setShowMealForm(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || getText('Failed to generate meal plan', 'Échec de la génération', 'فشل في إنشاء خطة الوجبات'))
    }
  })

  const handleSendMessage = () => {
    if (!message.trim()) return
    
    const latestWeight = weightHistory?.[weightHistory.length - 1]?.weight
    
    setConversation(prev => [...prev, { role: 'user', content: message, timestamp: new Date() }])
    setIsTyping(true)
    
    chatMutation.mutate({
      message,
      context: {
        user: {
          name: userData?.name?.split(' ')[0] || 'Athlete',
          role: userData?.role,
          height: userData?.height,
          weight: latestWeight,
          goals: userData?.goals
        },
        recentWorkouts: workouts?.slice(0, 3),
        currentDietPlan: dietPlan
      }
    })
    
    setMessage('')
  }

  const handleQuickQuestion = (question) => {
    setMessage(question)
    setTimeout(() => handleSendMessage(), 100)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickQuestions = [
    { icon: Dumbbell, text: getText('Suggest a workout for weight loss', 'Suggère un entraînement pour perdre du poids', 'اقترح تمرينًا لفقدان الوزن'), color: 'blue' },
    { icon: Apple, text: getText('Create a healthy meal plan', 'Crée un plan de repas sain', 'إنشاء خطة وجبات صحية'), color: 'green' },
    { icon: Target, text: getText('How to reach my fitness goal?', 'Comment atteindre mon objectif fitness ?', 'كيف أحقق هدفي اللياقي؟'), color: 'purple' },
    { icon: Heart, text: getText('Tips for staying motivated', 'Conseils pour rester motivé', 'نصائح للبقاء متحفزاً'), color: 'red' }
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return getText('Good morning', 'Bonjour', 'صباح الخير')
    if (hour < 18) return getText('Good afternoon', 'Bon après-midi', 'مساء الخير')
    return getText('Good evening', 'Bonsoir', 'مساء الخير')
  }

  // Show loading while checking access
  if (accessLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If no access, show upgrade page
  if (!accessData?.hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8">
        <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-xl">
          <Crown className="h-14 w-14 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {getText('AI Assistant Locked', 'Assistant IA Verrouillé', 'المساعد الذكي مقفل')} 🔒
        </h1>
        <p className="text-gray-600 mb-6 max-w-md">
          {accessData?.message || getText(
            'AI Assistant is a premium feature available only for Premium and Elite subscribers.',
            "L'assistant IA est une fonctionnalité premium disponible uniquement pour les abonnés Premium et Elite.",
            'المساعد الذكي هو ميزة مميزة متاحة فقط للمشتركين في بريميوم وإيليت.'
          )}
        </p>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 max-w-md w-full mb-6">
          <h3 className="font-bold text-xl text-gray-900 mb-3 flex items-center gap-2 justify-center">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {getText('Unlock AI Features', 'Débloquez les fonctionnalités IA', 'افتح ميزات الذكاء الاصطناعي')}
            <Sparkles className="h-5 w-5 text-pink-500" />
          </h3>
          <ul className="text-sm text-gray-700 space-y-2 mb-5 text-left">
            <li className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500" /> {getText('Personalized AI workout plans', 'Plans d\'entraînement IA personnalisés', 'خطط تمارين مخصصة بالذكاء الاصطناعي')}
            </li>
            <li className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" /> {getText('Smart nutrition recommendations', 'Recommandations nutritionnelles intelligentes', 'توصيات غذائية ذكية')}
            </li>
            <li className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" /> {getText('24/7 AI fitness coaching', 'Coaching fitness IA 24/7', 'تدريب لياقة بالذكاء الاصطناعي 24/7')}
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" /> {getText('Progress predictions and insights', 'Prédictions de progression et insights', 'توقعات التقدم والرؤى')}
            </li>
          </ul>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 text-center">
              <Gem className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <p className="text-xs font-semibold">Premium</p>
              <p className="text-xs text-gray-500">149 MAD/mo</p>
            </div>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 text-center">
              <Diamond className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs font-semibold">Elite</p>
              <p className="text-xs text-gray-600">249 MAD/mo</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/subscription')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
          >
            {getText('Upgrade to Premium', 'Passer à Premium', 'الترقية إلى بريميوم')}
          </button>
        </div>
        
        <p className="text-xs text-gray-400">
          {getText('Already have Premium or Elite? Contact support if you still see this message.', 'Vous avez déjà Premium ou Elite ? Contactez le support si vous voyez toujours ce message.', 'لديك بالفعل بريميوم أو إيليت؟ اتصل بالدعم إذا كنت لا تزال ترى هذه الرسالة.')}
        </p>
      </div>
    )
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {getText('AI Fitness Assistant', 'Assistant Fitness IA', 'مساعد اللياقة الذكي')}
                </h1>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full">
                  <Crown className="h-3 w-3 text-white" />
                  <span className="text-[10px] text-white font-bold uppercase">{accessData?.plan}</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                {getText('Powered by Google Gemini - Premium AI Coach', 'Propulsé par Google Gemini - Coach IA Premium', 'مدعوم من Google Gemini - مدرب ذكي مميز')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full">
            <Diamond className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-medium text-purple-600">
              {getText('Premium Feature', 'Fonctionnalité Premium', 'ميزة بريميوم')}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'chat'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          {getText('AI Chat', 'Chat IA', 'محادثة ذكية')}
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'generate'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          {getText('Generate Plans', 'Générer des Plans', 'إنشاء خطط')}
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'saved'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Save className="h-4 w-4" />
          {getText('Saved', 'Sauvegardés', 'المحفوظات')}
          {savedRecommendations.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
              {savedRecommendations.length}
            </span>
          )}
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {getGreeting()}, {userData?.name?.split(' ')[0] || 'Athlete'}! 👋
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {getText(
                    "I'm your AI fitness assistant powered by Google Gemini. Ask me anything about workouts, nutrition, or fitness goals!",
                    "Je suis votre assistant fitness IA propulsé par Google Gemini. Demandez-moi n'importe quoi sur l'entraînement, la nutrition ou vos objectifs fitness !",
                    "أنا مساعد اللياقة الذكي المدعوم من Google Gemini. اسألني أي شيء عن التمارين أو التغذية أو أهداف اللياقة!"
                  )}
                </p>
                
                {(userData?.height || weightHistory?.length > 0 || userData?.goals) && (
                  <div className="mt-6 p-3 bg-gray-50 rounded-xl max-w-md mx-auto">
                    <p className="text-xs text-gray-500 mb-2">
                      {getText('Your context:', 'Votre contexte:', 'سياقك:')}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 text-xs">
                      {userData?.height && (
                        <span className="text-gray-600">📏 {userData.height} cm</span>
                      )}
                      {weightHistory?.length > 0 && (
                        <span className="text-gray-600">⚖️ {weightHistory[weightHistory.length - 1]?.weight} kg</span>
                      )}
                      {userData?.goals && (
                        <span className="text-gray-600">🎯 {userData.goals.replace('_', ' ')}</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3 mt-6 max-w-lg mx-auto">
                  {quickQuestions.map((q, idx) => {
                    const Icon = q.icon
                    return (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(q.text)}
                        className={`flex items-center gap-2 p-3 bg-${q.color}-50 rounded-xl text-${q.color}-700 hover:bg-${q.color}-100 transition text-sm text-left`}
                      >
                        <Icon className={`h-4 w-4 text-${q.color}-500 flex-shrink-0`} />
                        <span className="flex-1 text-xs">{q.text}</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-start gap-2">
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-purple-200' : 'text-gray-400'}`}>
                        {format(new Date(msg.timestamp), 'HH:mm')}
                      </p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium">{userData?.name?.charAt(0) || 'U'}</span>
                      </div>
                    )}
                  </div>

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 ml-10">
                      {msg.suggestions.map((suggestion, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleQuickQuestion(suggestion)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-gray-500">
                    {getText('Gemini is thinking...', 'Gemini réfléchit...', 'Gemini يفكر...')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={getText(
                  "Ask me anything about fitness, nutrition, or workouts...",
                  "Demandez-moi n'importe quoi sur le fitness, la nutrition ou l'entraînement...",
                  "اسألني أي شيء عن اللياقة أو التغذية أو التمارين..."
                )}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={chatMutation.isPending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || chatMutation.isPending}
                className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 shadow-md"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="flex justify-center gap-4 mt-3 text-xs text-gray-400">
              <span>💪 {getText('Personalized advice', 'Conseils personnalisés', 'نصائح مخصصة')}</span>
              <span>🍎 {getText('Nutrition tips', 'Conseils nutritionnels', 'نصائح غذائية')}</span>
              <span>📊 {getText('Progress tracking', 'Suivi de progression', 'تتبع التقدم')}</span>
              <span>🤖 {getText('Gemini AI', 'IA Gemini', 'Gemini AI')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Generate Plans Tab */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Dumbbell className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {getText('Generate Workout Plan', 'Générer un plan d\'entraînement', 'إنشاء خطة تمرين')}
                </h3>
                <p className="text-xs text-gray-500">
                  {getText('Powered by Google Gemini', 'Propulsé par Google Gemini', 'مدعوم من Google Gemini')}
                </p>
              </div>
            </div>

            {!showWorkoutForm ? (
              <button
                onClick={() => setShowWorkoutForm(true)}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {getText('Create New Workout Plan', 'Créer un nouveau plan', 'إنشاء خطة تمرين جديدة')}
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('Goal', 'Objectif', 'الهدف')}
                  </label>
                  <select
                    value={workoutPreferences.goal}
                    onChange={(e) => setWorkoutPreferences({ ...workoutPreferences, goal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="weight_loss">{getText('Weight Loss', 'Perte de poids', 'فقدان الوزن')}</option>
                    <option value="muscle_gain">{getText('Muscle Gain', 'Gain musculaire', 'زيادة العضلات')}</option>
                    <option value="endurance">{getText('Endurance', 'Endurance', 'التحمل')}</option>
                    <option value="strength">{getText('Strength', 'Force', 'القوة')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('Duration (minutes)', 'Durée (minutes)', 'المدة (دقائق)')}
                  </label>
                  <select
                    value={workoutPreferences.duration}
                    onChange={(e) => setWorkoutPreferences({ ...workoutPreferences, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="15">15 {getText('min', 'min', 'دقيقة')}</option>
                    <option value="30">30 {getText('min', 'min', 'دقيقة')}</option>
                    <option value="45">45 {getText('min', 'min', 'دقيقة')}</option>
                    <option value="60">60 {getText('min', 'min', 'دقيقة')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('Frequency (days/week)', 'Fréquence (jours/semaine)', 'التكرار (أيام/أسبوع)')}
                  </label>
                  <select
                    value={workoutPreferences.frequency}
                    onChange={(e) => setWorkoutPreferences({ ...workoutPreferences, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="2">2 {getText('days/week', 'jours/semaine', 'أيام/أسبوع')}</option>
                    <option value="3">3 {getText('days/week', 'jours/semaine', 'أيام/أسبوع')}</option>
                    <option value="4">4 {getText('days/week', 'jours/semaine', 'أيام/أسبوع')}</option>
                    <option value="5">5 {getText('days/week', 'jours/semaine', 'أيام/أسبوع')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('Equipment', 'Équipement', 'المعدات')}
                  </label>
                  <select
                    value={workoutPreferences.equipment}
                    onChange={(e) => setWorkoutPreferences({ ...workoutPreferences, equipment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="none">{getText('No equipment', 'Sans équipement', 'بدون معدات')}</option>
                    <option value="dumbbells">{getText('Dumbbells only', 'Haltères seulement', 'دمبل فقط')}</option>
                    <option value="gym">{getText('Full gym', 'Salle de sport complète', 'صالة رياضية كاملة')}</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => generateWorkoutMutation.mutate(workoutPreferences)}
                    disabled={generateWorkoutMutation.isPending}
                    className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
                  >
                    {generateWorkoutMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin inline" />
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 inline mr-2" />
                        {getText('Generate', 'Générer', 'إنشاء')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowWorkoutForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    {getText('Cancel', 'Annuler', 'إلغاء')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Apple className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {getText('Generate Meal Plan', 'Générer un plan de repas', 'إنشاء خطة وجبات')}
                </h3>
                <p className="text-xs text-gray-500">
                  {getText('Powered by Google Gemini', 'Propulsé par Google Gemini', 'مدعوم من Google Gemini')}
                </p>
              </div>
            </div>

            {!showMealForm ? (
              <button
                onClick={() => setShowMealForm(true)}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {getText('Create New Meal Plan', 'Créer un nouveau plan de repas', 'إنشاء خطة وجبات جديدة')}
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('Goal', 'Objectif', 'الهدف')}
                  </label>
                  <select
                    value={mealPreferences.goal}
                    onChange={(e) => setMealPreferences({ ...mealPreferences, goal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="weight_loss">{getText('Weight Loss', 'Perte de poids', 'فقدان الوزن')}</option>
                    <option value="muscle_gain">{getText('Muscle Gain', 'Gain musculaire', 'زيادة العضلات')}</option>
                    <option value="maintenance">{getText('Maintenance', 'Maintien', 'الحفاظ')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('Daily Calories', 'Calories par jour', 'السعرات اليومية')}
                  </label>
                  <select
                    value={mealPreferences.calories}
                    onChange={(e) => setMealPreferences({ ...mealPreferences, calories: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="1500">1500 {getText('cal', 'cal', 'سعرة')}</option>
                    <option value="2000">2000 {getText('cal', 'cal', 'سعرة')}</option>
                    <option value="2500">2500 {getText('cal', 'cal', 'سعرة')}</option>
                    <option value="3000">3000 {getText('cal', 'cal', 'سعرة')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('Diet Type', 'Type de régime', 'نوع النظام الغذائي')}
                  </label>
                  <select
                    value={mealPreferences.dietType}
                    onChange={(e) => setMealPreferences({ ...mealPreferences, dietType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="omnivore">{getText('Omnivore', 'Omnivore', 'كل شيء')}</option>
                    <option value="vegetarian">{getText('Vegetarian', 'Végétarien', 'نباتي')}</option>
                    <option value="vegan">{getText('Vegan', 'Végétalien', 'نباتي صرف')}</option>
                    <option value="keto">{getText('Keto', 'Keto', 'كيتو')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('Allergies (optional)', 'Allergies (optionnel)', 'حساسية (اختياري)')}
                  </label>
                  <input
                    type="text"
                    value={mealPreferences.allergies}
                    onChange={(e) => setMealPreferences({ ...mealPreferences, allergies: e.target.value })}
                    placeholder={getText('e.g., nuts, dairy, gluten', 'ex: noix, produits laitiers, gluten', 'مثال: مكسرات، ألبان، جلوتين')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => generateMealMutation.mutate(mealPreferences)}
                    disabled={generateMealMutation.isPending}
                    className="flex-1 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition disabled:opacity-50"
                  >
                    {generateMealMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin inline" />
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 inline mr-2" />
                        {getText('Generate', 'Générer', 'إنشاء')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowMealForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    {getText('Cancel', 'Annuler', 'إلغاء')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Tab */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedRecommendations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Save className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {getText('No saved recommendations', 'Aucune recommandation sauvegardée', 'لا توجد توصيات محفوظة')}
              </h3>
              <p className="text-gray-500">
                {getText('Generate plans and they will appear here', 'Générez des plans et ils apparaîtront ici', 'قم بإنشاء خطط وستظهر هنا')}
              </p>
            </div>
          ) : (
            savedRecommendations.map((rec, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {rec.type === 'workout' ? (
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Dumbbell className="h-4 w-4 text-purple-600" />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <Apple className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-900">
                      {rec.type === 'workout' 
                        ? getText('Workout Plan', 'Plan d\'entraînement', 'خطة تمرين')
                        : getText('Meal Plan', 'Plan de repas', 'خطة وجبات')
                      }
                    </h3>
                  </div>
                  <div className="text-xs text-gray-400">
                    {format(new Date(rec.savedAt), 'MMM dd, HH:mm')}
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-3">
                    {rec.message}
                  </p>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setMessage(rec.message.substring(0, 100))
                      setActiveTab('chat')
                    }}
                    className="px-3 py-1 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition"
                  >
                    {getText('Ask about this', 'Poser une question', 'اسأل عن هذا')}
                  </button>
                  <button
                    onClick={() => {
                      setSavedRecommendations(prev => prev.filter((_, i) => i !== idx))
                    }}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                  >
                    {getText('Delete', 'Supprimer', 'حذف')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Stats Cards */}
      
    </div>
  )
}

export default AIAssistant