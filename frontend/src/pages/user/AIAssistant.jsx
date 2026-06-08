import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { 
  Bot, Sparkles, Send, Dumbbell, Apple, Target, 
  MessageCircle, Brain, Heart, Clock, Calendar, 
  TrendingUp, Award, Zap, ChevronRight, Loader2,
  ThumbsUp, ThumbsDown, RefreshCw, Save, Share2,
  BarChart3, Activity, Flame, Crown, Star, Shield,
  Diamond, Gem, Menu, X, Home, User, Settings,
  Plus, Trash2, Copy, Check, Mic, MicOff,
  Volume2, VolumeX, Download, FolderOpen
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState(null)
  const [recognition, setRecognition] = useState(null)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const inputRef = useRef(null)

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

  // Load saved recommendations from localStorage on mount
  useEffect(() => {
    const loadSavedRecommendations = () => {
      try {
        const saved = localStorage.getItem('ai_saved_recommendations')
        if (saved) {
          const parsed = JSON.parse(saved)
          // Convert savedAt strings back to Date objects
          const withDates = parsed.map(item => ({
            ...item,
            savedAt: new Date(item.savedAt)
          }))
          setSavedRecommendations(withDates)
        }
      } catch (error) {
        console.error('Error loading saved recommendations:', error)
      }
    }
    loadSavedRecommendations()
  }, [])

  // Save recommendations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('ai_saved_recommendations', JSON.stringify(savedRecommendations))
    } catch (error) {
      console.error('Error saving recommendations:', error)
    }
  }, [savedRecommendations])

  // Load conversation from localStorage
  useEffect(() => {
    const loadConversation = () => {
      try {
        const saved = localStorage.getItem('ai_conversation')
        if (saved) {
          const parsed = JSON.parse(saved)
          const withDates = parsed.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
          setConversation(withDates)
        }
      } catch (error) {
        console.error('Error loading conversation:', error)
      }
    }
    loadConversation()
  }, [])

  // Save conversation to localStorage
  useEffect(() => {
    if (conversation.length > 0) {
      try {
        localStorage.setItem('ai_conversation', JSON.stringify(conversation))
      } catch (error) {
        console.error('Error saving conversation:', error)
      }
    }
  }, [conversation])

  // Initialize Web Speech API for voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = isFrench ? 'fr-FR' : isRTL ? 'ar-SA' : 'en-US'
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setMessage(transcript)
        setIsRecording(false)
        toast.success(getText('Voice captured!', 'Voix capturée !', 'تم التقاط الصوت!'))
      }
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        if (event.error === 'not-allowed') {
          toast.error(getText('Microphone access denied', 'Accès au microphone refusé', 'تم رفض الوصول إلى الميكروفون'))
        } else {
          toast.error(getText('Voice recognition failed', 'Reconnaissance vocale échouée', 'فشل التعرف على الصوت'))
        }
      }
      
      recognitionInstance.onend = () => {
        setIsRecording(false)
      }
      
      setRecognition(recognitionInstance)
    } else {
      setIsSpeechSupported(false)
      console.warn('Speech recognition not supported in this browser')
    }
  }, [isFrench, isRTL])

  // Text-to-Speech function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = isFrench ? 'fr-FR' : isRTL ? 'ar-SA' : 'en-US'
      utterance.rate = 0.9
      utterance.pitch = 1
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      window.speechSynthesis.speak(utterance)
    } else {
      toast.error(getText('Text-to-speech not supported', 'Synthèse vocale non supportée', 'تحويل النص إلى كلام غير مدعوم'))
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleVoiceInput = () => {
    if (!recognition) {
      toast.error(getText('Voice recognition not supported in your browser', 'Reconnaissance vocale non supportée', 'التعرف على الصوت غير مدعوم في متصفحك'))
      return
    }
    
    if (isRecording) {
      recognition.stop()
      setIsRecording(false)
    } else {
      try {
        recognition.start()
        setIsRecording(true)
        toast.success(getText('Listening... Speak now', 'Écoute... Parlez maintenant', 'يستمع... تحدث الآن'))
      } catch (error) {
        console.error('Error starting recognition:', error)
        toast.error(getText('Failed to start voice recognition', 'Échec du démarrage de la reconnaissance vocale', 'فشل في بدء التعرف على الصوت'))
        setIsRecording(false)
      }
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversation, isTyping])

  // Check AI access
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

  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        const response = await api.get('/auth/me')
        return response.data.data?.user || response.data.user
      } catch (error) {
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
      const newAssistantMessage = { 
        role: 'assistant', 
        content: data.message, 
        suggestions: data.suggestions || [
          getText('Create a workout plan for me', 'Créez un plan d\'entraînement pour moi', 'قم بإنشاء خطة تمرين لي'),
          getText('Help with my nutrition', 'Aide-moi avec ma nutrition', 'ساعدني في التغذية'),
          getText('How to stay motivated?', 'Comment rester motivé ?', 'كيف أبقى متحفزاً?'),
          getText('Best exercises for abs', 'Meilleurs exercices pour les abdos', 'أفضل تمارين للبطن')
        ],
        timestamp: new Date() 
      }
      setConversation(prev => [...prev, newAssistantMessage])
      setIsTyping(false)
      
      // Auto-speak the response (optional - can be toggled by user)
      // speakText(data.message)
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
      const newPlan = { 
        type: 'workout', 
        message: data.message, 
        preferences: workoutPreferences,
        savedAt: new Date(),
        id: Date.now()
      }
      setSavedRecommendations(prev => [newPlan, ...prev])
      toast.success(getText('Workout plan saved!', 'Plan d\'entraînement sauvegardé !', 'تم حفظ خطة التمرين!'))
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
      const newPlan = { 
        type: 'meal', 
        message: data.message, 
        preferences: mealPreferences,
        savedAt: new Date(),
        id: Date.now()
      }
      setSavedRecommendations(prev => [newPlan, ...prev])
      toast.success(getText('Meal plan saved!', 'Plan de repas sauvegardé !', 'تم حفظ خطة الوجبات!'))
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
    if (inputRef.current) inputRef.current.focus()
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

  const handleCopyMessage = (content, messageId) => {
    navigator.clipboard.writeText(content)
    setCopiedMessageId(messageId)
    setTimeout(() => setCopiedMessageId(null), 2000)
    toast.success(getText('Copied to clipboard', 'Copié dans le presse-papier', 'تم النسخ إلى الحافظة'))
  }

  const handleSaveMessage = (content, type) => {
    const newSaved = {
      id: Date.now(),
      type: type,
      message: content,
      savedAt: new Date()
    }
    setSavedRecommendations(prev => [newSaved, ...prev])
    toast.success(getText('Message saved!', 'Message sauvegardé !', 'تم حفظ الرسالة!'))
  }

  const clearConversation = () => {
    if (conversation.length > 0) {
      if (window.confirm(getText('Clear all messages?', 'Effacer tous les messages ?', 'مسح جميع الرسائل؟'))) {
        setConversation([])
        localStorage.removeItem('ai_conversation')
        toast.success(getText('Conversation cleared', 'Conversation effacée', 'تم مسح المحادثة'))
      }
    }
  }

  const exportConversation = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: userData?.name,
      conversation: conversation.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }))
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-conversation-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(getText('Conversation exported!', 'Conversation exportée !', 'تم تصدير المحادثة!'))
  }

  const deleteSavedItem = (id) => {
    setSavedRecommendations(prev => prev.filter(item => item.id !== id))
    toast.success(getText('Deleted successfully', 'Supprimé avec succès', 'تم الحذف بنجاح'))
  }

  const quickQuestions = [
    { icon: Dumbbell, text: getText('Workout for weight loss', 'Entraînement pour perte de poids', 'تمرين لفقدان الوزن'), color: 'blue' },
    { icon: Apple, text: getText('Healthy meal plan', 'Plan de repas sain', 'خطة وجبات صحية'), color: 'green' },
    { icon: Target, text: getText('Reach my fitness goal', 'Atteindre mon objectif', 'تحقيق هدفي اللياقي'), color: 'purple' },
    { icon: Heart, text: getText('Stay motivated', 'Rester motivé', 'البقاء متحفزاً'), color: 'red' },
    { icon: Flame, text: getText('Burn more calories', 'Brûler plus de calories', 'حرق المزيد من السعرات'), color: 'orange' },
    { icon: Brain, text: getText('Best workout split', 'Meilleur split d\'entraînement', 'أفضل تقسيم للتمرين'), color: 'indigo' }
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return getText('Good morning', 'Bonjour', 'صباح الخير')
    if (hour < 18) return getText('Good afternoon', 'Bon après-midi', 'مساء الخير')
    return getText('Good evening', 'Bonsoir', 'مساء الخير')
  }

  // Mobile bottom navigation
  const MobileNav = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex justify-around">
        {[
          { id: 'chat', icon: MessageCircle, label: getText('Chat', 'Chat', 'محادثة') },
          { id: 'generate', icon: Sparkles, label: getText('Generate', 'Générer', 'إنشاء') },
          { id: 'saved', icon: Save, label: getText('Saved', 'Sauvegardés', 'محفوظات') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setIsMobileMenuOpen(false)
            }}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition ${
              activeTab === tab.id
                ? 'text-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!accessData?.hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 py-8">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-xl">
          <Crown className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {getText('AI Assistant Locked', 'Assistant IA Verrouillé', 'المساعد الذكي مقفل')} 🔒
        </h1>
        <p className="text-gray-600 mb-6 max-w-md text-sm md:text-base">
          {getText(
            'AI Assistant is a premium feature available only for Premium and Elite subscribers.',
            "L'assistant IA est une fonctionnalité premium disponible uniquement pour les abonnés Premium et Elite.",
            'المساعد الذكي هو ميزة مميزة متاحة فقط للمشتركين في بريميوم وإيليت.'
          )}
        </p>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 max-w-md w-full mb-6">
          <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2 justify-center">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {getText('Unlock AI Features', 'Débloquez les fonctionnalités IA', 'افتح ميزات الذكاء الاصطناعي')}
          </h3>
          <ul className="text-sm text-gray-700 space-y-2 mb-5 text-left">
            <li className="flex items-center gap-2">💪 {getText('Personalized AI workout plans', 'Plans d\'entraînement IA personnalisés', 'خطط تمارين مخصصة بالذكاء الاصطناعي')}</li>
            <li className="flex items-center gap-2">🥗 {getText('Smart nutrition recommendations', 'Recommandations nutritionnelles intelligentes', 'توصيات غذائية ذكية')}</li>
            <li className="flex items-center gap-2">🎯 {getText('24/7 AI fitness coaching', 'Coaching fitness IA 24/7', 'تدريب لياقة بالذكاء الاصطناعي 24/7')}</li>
            <li className="flex items-center gap-2">📊 {getText('Progress predictions and insights', 'Prédictions de progression et insights', 'توقعات التقدم والرؤى')}</li>
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
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md text-sm md:text-base"
          >
            {getText('Upgrade to Premium', 'Passer à Premium', 'الترقية إلى بريميوم')}
          </button>
        </div>
      </div>
    )
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="pb-20 lg:pb-0 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg md:rounded-xl">
              <Bot className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                  {getText('AI Coach', 'Coach IA', 'مدرب ذكي')}
                </h1>
                <div className="flex items-center gap-1 px-1.5 py-0.5 md:px-2 md:py-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full">
                  <Crown className="h-2 w-2 md:h-3 md:w-3 text-white" />
                  <span className="text-[8px] md:text-[10px] text-white font-bold uppercase">{accessData?.plan}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                {getText('Powered by Google Gemini', 'Propulsé par Google Gemini', 'مدعوم من Google Gemini')}
              </p>
            </div>
          </div>
          
          {/* Desktop Tabs */}
          <div className="hidden lg:flex gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'chat'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              {getText('Chat', 'Chat', 'محادثة')}
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'generate'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              {getText('Generate', 'Générer', 'إنشاء')}
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'saved'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Save className="h-4 w-4" />
              {getText('Saved', 'Sauvegardés', 'محفوظات')}
              {savedRecommendations.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                  {savedRecommendations.length}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            {conversation.length > 0 && (
              <>
                <button
                  onClick={exportConversation}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  title={getText('Export conversation', 'Exporter la conversation', 'تصدير المحادثة')}
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={clearConversation}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title={getText('Clear conversation', 'Effacer la conversation', 'مسح المحادثة')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg p-2 z-50">
            {[
              { id: 'chat', label: getText('💬 Chat', '💬 Chat', '💬 محادثة'), icon: MessageCircle },
              { id: 'generate', label: getText('✨ Generate', '✨ Générer', '✨ إنشاء'), icon: Sparkles },
              { id: 'saved', label: getText('📦 Saved', '📦 Sauvegardés', '📦 محفوظات'), icon: Save },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
                {tab.id === 'saved' && savedRecommendations.length > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                    {savedRecommendations.length}
                  </span>
                )}
              </button>
            ))}
            <div className="border-t my-2"></div>
            <button
              onClick={() => {
                exportConversation()
                setIsMobileMenuOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <Download className="h-5 w-5" />
              <span className="font-medium">{getText('Export Chat', 'Exporter le chat', 'تصدير المحادثة')}</span>
            </button>
            <button
              onClick={() => {
                clearConversation()
                setIsMobileMenuOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5" />
              <span className="font-medium">{getText('Clear Chat', 'Effacer le chat', 'مسح المحادثة')}</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-3 md:p-6 max-w-7xl mx-auto">
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="flex flex-col bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            {/* Messages Area */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
              {conversation.length === 0 && (
                <div className="text-center py-6 md:py-12">
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Bot className="h-7 w-7 md:h-10 md:w-10 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    {getGreeting()}, {userData?.name?.split(' ')[0] || 'Athlete'}! 👋
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto px-4">
                    {getText(
                      "I'm your AI fitness coach. Ask me anything about workouts, nutrition, or fitness goals!",
                      "Je suis votre coach fitness IA. Demandez-moi n'importe quoi sur l'entraînement, la nutrition ou vos objectifs fitness !",
                      "أنا مدرب اللياقة الذكي الخاص بك. اسألني أي شيء عن التمارين أو التغذية أو أهداف اللياقة!"
                    )}
                  </p>
                  
                  {/* Quick Questions Grid */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3 mt-6 max-w-lg mx-auto px-2">
                    {quickQuestions.map((q, idx) => {
                      const Icon = q.icon
                      return (
                        <button
                          key={idx}
                          onClick={() => handleQuickQuestion(q.text)}
                          className="flex items-center gap-2 p-2 md:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition text-left"
                        >
                          <Icon className={`h-4 w-4 text-${q.color}-500 flex-shrink-0`} />
                          <span className="text-xs md:text-sm flex-1 line-clamp-2">{q.text}</span>
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
                  <div className={`max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-start gap-2">
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm md:text-base whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className="flex items-center justify-between mt-1 gap-2">
                          <p className={`text-[10px] md:text-xs ${msg.role === 'user' ? 'text-purple-200' : 'text-gray-400'}`}>
                            {format(new Date(msg.timestamp), 'HH:mm')}
                          </p>
                          <div className="flex items-center gap-1">
                            {msg.role === 'assistant' && (
                              <button
                                onClick={() => speakText(msg.content)}
                                className="p-1 hover:bg-white/20 rounded transition"
                                title={getText('Listen', 'Écouter', 'استماع')}
                              >
                                {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                              </button>
                            )}
                            <button
                              onClick={() => handleCopyMessage(msg.content, idx)}
                              className="p-1 hover:bg-white/20 rounded transition"
                              title={getText('Copy', 'Copier', 'نسخ')}
                            >
                              {copiedMessageId === idx ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                            <button
                              onClick={() => handleSaveMessage(msg.content, msg.role === 'assistant' ? 'ai_message' : 'user_message')}
                              className="p-1 hover:bg-white/20 rounded transition"
                              title={getText('Save', 'Sauvegarder', 'حفظ')}
                            >
                              <Save className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs md:text-sm font-medium">{userData?.name?.charAt(0) || 'U'}</span>
                        </div>
                      )}
                    </div>

                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1 md:gap-2 mt-2 ml-0 md:ml-10">
                        {msg.suggestions.slice(0, 3).map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleQuickQuestion(suggestion)}
                            className="px-2 py-1 md:px-3 md:py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-[10px] md:text-xs text-gray-600 transition"
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
                  <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2 md:px-4 md:py-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-500">
                      {getText('Gemini is thinking...', 'Gemini réfléchit...', 'Gemini يفكر...')}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={getText(
                      "Ask me anything...",
                      "Demandez-moi n'importe quoi...",
                      "اسألني أي شيء..."
                    )}
                    rows={1}
                    className="w-full px-3 py-2 md:px-4 md:py-2.5 pr-24 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm md:text-base"
                    style={{ maxHeight: '100px' }}
                    disabled={chatMutation.isPending}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    {isSpeechSupported && (
                      <button
                        onClick={handleVoiceInput}
                        className={`p-1.5 rounded-lg transition ${
                          isRecording ? 'bg-red-100 text-red-500 animate-pulse' : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title={getText('Voice input', 'Entrée vocale', 'إدخال صوتي')}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || chatMutation.isPending}
                  className="p-2 md:p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 shadow-md"
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                </button>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                {isRecording && (
                  <div className="flex items-center gap-2 text-xs text-red-500">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    {getText('Recording... Speak now', 'Enregistrement... Parlez maintenant', 'يسجل... تحدث الآن')}
                  </div>
                )}
                <div className="flex-1"></div>
                {conversation.length > 0 && (
                  <button
                    onClick={exportConversation}
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    {getText('Export', 'Exporter', 'تصدير')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Generate Plans Tab */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Workout Plan Card */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Dumbbell className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    {getText('Workout Plan', 'Plan d\'entraînement', 'خطة تمرين')}
                  </h3>
                  <p className="text-xs text-gray-500">Powered by Google Gemini</p>
                </div>
              </div>

              {!showWorkoutForm ? (
                <button
                  onClick={() => setShowWorkoutForm(true)}
                  className="w-full py-2.5 md:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Sparkles className="h-4 w-4" />
                  {getText('Create Plan', 'Créer un plan', 'إنشاء خطة')}
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      {getText('Goal', 'Objectif', 'الهدف')}
                    </label>
                    <select
                      value={workoutPreferences.goal}
                      onChange={(e) => setWorkoutPreferences({ ...workoutPreferences, goal: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="weight_loss">{getText('Weight Loss', 'Perte de poids', 'فقدان الوزن')}</option>
                      <option value="muscle_gain">{getText('Muscle Gain', 'Gain musculaire', 'زيادة العضلات')}</option>
                      <option value="endurance">{getText('Endurance', 'Endurance', 'التحمل')}</option>
                      <option value="strength">{getText('Strength', 'Force', 'القوة')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      {getText('Duration', 'Durée', 'المدة')}
                    </label>
                    <select
                      value={workoutPreferences.duration}
                      onChange={(e) => setWorkoutPreferences({ ...workoutPreferences, duration: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    >
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      {getText('Frequency', 'Fréquence', 'التكرار')}
                    </label>
                    <select
                      value={workoutPreferences.frequency}
                      onChange={(e) => setWorkoutPreferences({ ...workoutPreferences, frequency: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    >
                      <option value="2">2 {getText('days/week', 'jours/semaine', 'أيام/أسبوع')}</option>
                      <option value="3">3 {getText('days/week', 'jours/semaine', 'أيام/أسبوع')}</option>
                      <option value="4">4 {getText('days/week', 'jours/semaine', 'أيام/أسبوع')}</option>
                      <option value="5">5 {getText('days/week', 'jours/semaine', 'أيام/أسبوع')}</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => generateWorkoutMutation.mutate(workoutPreferences)}
                      disabled={generateWorkoutMutation.isPending}
                      className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 text-sm"
                    >
                      {generateWorkoutMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin inline" />
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 inline mr-1" />
                          {getText('Generate & Save', 'Générer & Sauvegarder', 'إنشاء وحفظ')}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowWorkoutForm(false)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                    >
                      {getText('Cancel', 'Annuler', 'إلغاء')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Meal Plan Card */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Apple className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    {getText('Meal Plan', 'Plan de repas', 'خطة وجبات')}
                  </h3>
                  <p className="text-xs text-gray-500">Powered by Google Gemini</p>
                </div>
              </div>

              {!showMealForm ? (
                <button
                  onClick={() => setShowMealForm(true)}
                  className="w-full py-2.5 md:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Sparkles className="h-4 w-4" />
                  {getText('Create Plan', 'Créer un plan', 'إنشاء خطة')}
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      {getText('Goal', 'Objectif', 'الهدف')}
                    </label>
                    <select
                      value={mealPreferences.goal}
                      onChange={(e) => setMealPreferences({ ...mealPreferences, goal: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    >
                      <option value="weight_loss">{getText('Weight Loss', 'Perte de poids', 'فقدان الوزن')}</option>
                      <option value="muscle_gain">{getText('Muscle Gain', 'Gain musculaire', 'زيادة العضلات')}</option>
                      <option value="maintenance">{getText('Maintenance', 'Maintien', 'الحفاظ')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      {getText('Calories', 'Calories', 'السعرات')}
                    </label>
                    <select
                      value={mealPreferences.calories}
                      onChange={(e) => setMealPreferences({ ...mealPreferences, calories: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    >
                      <option value="1500">1500 cal</option>
                      <option value="2000">2000 cal</option>
                      <option value="2500">2500 cal</option>
                      <option value="3000">3000 cal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      {getText('Diet Type', 'Type de régime', 'نوع النظام الغذائي')}
                    </label>
                    <select
                      value={mealPreferences.dietType}
                      onChange={(e) => setMealPreferences({ ...mealPreferences, dietType: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    >
                      <option value="omnivore">{getText('Omnivore', 'Omnivore', 'كل شيء')}</option>
                      <option value="vegetarian">{getText('Vegetarian', 'Végétarien', 'نباتي')}</option>
                      <option value="vegan">{getText('Vegan', 'Végétalien', 'نباتي صرف')}</option>
                      <option value="keto">Keto</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => generateMealMutation.mutate(mealPreferences)}
                      disabled={generateMealMutation.isPending}
                      className="flex-1 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 text-sm"
                    >
                      {generateMealMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin inline" />
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 inline mr-1" />
                          {getText('Generate & Save', 'Générer & Sauvegarder', 'إنشاء وحفظ')}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowMealForm(false)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
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
          <div className="space-y-3 md:space-y-4">
            {savedRecommendations.length === 0 ? (
              <div className="text-center py-12 md:py-16 bg-white rounded-xl md:rounded-2xl border border-gray-200">
                <FolderOpen className="h-10 w-10 md:h-12 md:w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                  {getText('No saved plans', 'Aucun plan sauvegardé', 'لا توجد خطط محفوظة')}
                </h3>
                <p className="text-sm text-gray-500 px-4">
                  {getText('Generate plans and they will appear here', 'Générez des plans et ils apparaîtront ici', 'قم بإنشاء خطط وستظهر هنا')}
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-500">
                    {savedRecommendations.length} {getText('saved items', 'éléments sauvegardés', 'عناصر محفوظة')}
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm(getText('Delete all saved items?', 'Supprimer tous les éléments ?', 'حذف جميع العناصر المحفوظة؟'))) {
                        setSavedRecommendations([])
                        toast.success(getText('All items deleted', 'Tous les éléments supprimés', 'تم حذف جميع العناصر'))
                      }
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    {getText('Delete All', 'Tout supprimer', 'حذف الكل')}
                  </button>
                </div>
                {savedRecommendations.map((rec) => (
                  <div key={rec.id} className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 md:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {rec.type === 'workout' ? (
                          <div className="p-1.5 bg-purple-100 rounded-lg">
                            <Dumbbell className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
                          </div>
                        ) : rec.type === 'meal' ? (
                          <div className="p-1.5 bg-green-100 rounded-lg">
                            <Apple className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-blue-100 rounded-lg">
                            <MessageCircle className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                          </div>
                        )}
                        <h3 className="font-semibold text-sm md:text-base text-gray-900">
                          {rec.type === 'workout' && getText('Workout Plan', 'Plan d\'entraînement', 'خطة تمرين')}
                          {rec.type === 'meal' && getText('Meal Plan', 'Plan de repas', 'خطة وجبات')}
                          {rec.type !== 'workout' && rec.type !== 'meal' && getText('Saved Message', 'Message sauvegardé', 'رسالة محفوظة')}
                        </h3>
                      </div>
                      <div className="text-[10px] md:text-xs text-gray-400">
                        {format(new Date(rec.savedAt), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-600 text-xs md:text-sm whitespace-pre-wrap line-clamp-3">
                        {rec.message}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setMessage(rec.message.substring(0, 100))
                          setActiveTab('chat')
                          setIsMobileMenuOpen(false)
                        }}
                        className="px-2 py-1 md:px-3 md:py-1 text-[10px] md:text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition"
                      >
                        {getText('Ask about this', 'Poser une question', 'اسأل عن هذا')}
                      </button>
                      <button
                        onClick={() => speakText(rec.message)}
                        className="px-2 py-1 md:px-3 md:py-1 text-[10px] md:text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                      >
                        {getText('Listen', 'Écouter', 'استماع')}
                      </button>
                      <button
                        onClick={() => deleteSavedItem(rec.id)}
                        className="px-2 py-1 md:px-3 md:py-1 text-[10px] md:text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                      >
                        {getText('Delete', 'Supprimer', 'حذف')}
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  )
}

export default AIAssistant