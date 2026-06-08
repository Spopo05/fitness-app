import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  User,
  Target,
  TrendingUp,
  Calendar,
  Plus,
  MessageCircle,
  Apple,
  Dumbbell,
  Activity,
  Heart,
  Clock,
  Award,
  Flame,
  Zap,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Weight,
  Ruler,
  Crown,
  Star,
  Shield,
  Sparkles
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { format } from 'date-fns'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ProfilePictureModal from '../../components/ProfilePictureModal'

const UserDetails = () => {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [imageError, setImageError] = useState(false)

  const isRTL = i18n.language === 'ar'
  const isFrench = i18n.language === 'fr'

  const getText = (en, fr, ar) => {
    if (isFrench) return fr
    if (isRTL) return ar
    return en
  }

  // Fetch user details
  const { data: user, isLoading: userLoading, refetch } = useQuery({
    queryKey: ['userDetails', clientId],
    queryFn: async () => {
      const response = await api.get(`/coaches/users/${clientId}`)
      return response.data.data.user
    },
  })

  // Fetch user workouts
  const { data: workouts, isLoading: workoutsLoading } = useQuery({
    queryKey: ['userWorkouts', clientId],
    queryFn: async () => {
      const response = await api.get(`/coaches/users/${clientId}/workouts`)
      return response.data.data.workouts || []
    },
  })

  // Helper to get profile picture URL
  const getProfilePictureUrl = () => {
    if (!user?.profilePicture || imageError) return null
    if (user.profilePicture.startsWith('http')) {
      return user.profilePicture
    }
    return `http://localhost:5000/${user.profilePicture}`
  }

  const formatWeightData = (weightHistory) => {
    return weightHistory?.map(entry => ({
      date: format(new Date(entry.date), 'MMM dd'),
      weight: entry.weight
    })) || []
  }

  // Calculate BMI
  const calculateBMI = () => {
    if (!user?.height || !user?.weightHistory?.length) return null
    const latestWeight = user.weightHistory[user.weightHistory.length - 1]?.weight
    if (!latestWeight) return null
    const heightInMeters = user.height / 100
    const bmi = (latestWeight / (heightInMeters * heightInMeters)).toFixed(1)
    return bmi
  }

  const getBMICategory = (bmi) => {
    if (!bmi) return null
    if (bmi < 18.5) return { text: getText('Underweight', 'Insuffisance pondérale', 'نقص الوزن'), color: 'blue' }
    if (bmi < 25) return { text: getText('Healthy', 'Santé', 'صحي'), color: 'green' }
    if (bmi < 30) return { text: getText('Overweight', 'Surpoids', 'زيادة الوزن'), color: 'yellow' }
    return { text: getText('Obese', 'Obésité', 'سمنة'), color: 'red' }
  }

  const bmi = calculateBMI()
  const bmiCategory = getBMICategory(bmi)
  const latestWeight = user?.weightHistory?.[user.weightHistory.length - 1]?.weight
  const firstWeight = user?.weightHistory?.[0]?.weight
  const weightChange = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : null
  const isWeightDown = weightChange && weightChange < 0

  const tabs = [
    { id: 'overview', name: getText('Overview', 'Aperçu', 'نظرة عامة'), icon: Activity },
    { id: 'workouts', name: getText('Workouts', 'Entraînements', 'تمارين'), icon: Dumbbell },
    { id: 'diet', name: getText('Diet Plan', 'Plan alimentaire', 'خطة غذائية'), icon: Apple },
  ]

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
        <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">{getText('User not found', 'Utilisateur non trouvé', 'المستخدم غير موجود')}</p>
        <Link to="/clients" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          ← {getText('Back to Clients', 'Retour aux clients', 'العودة إلى العملاء')}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/clients"
                className="p-2 bg-white rounded-xl hover:bg-gray-100 transition-all shadow-sm"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                    {getText('Client Profile', 'Profil Client', 'ملف العميل')}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate(`/messages?userId=${user._id}`)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-md flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {getText('Send Message', 'Envoyer un message', 'إرسال رسالة')}
            </button>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="relative h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            <div className="absolute -bottom-12 left-6">
              <button
                onClick={() => setShowProfileModal(true)}
                className="focus:outline-none"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white p-1 shadow-xl ring-4 ring-white">
                  {getProfilePictureUrl() ? (
                    <img
                      src={getProfilePictureUrl()}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-xl"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
          
          <div className="pt-16 px-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="text-xs text-gray-500">{getText('Goal', 'Objectif', 'الهدف')}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {user.goals?.replace(/_/g, ' ') || getText('Not set', 'Non défini', 'غير محدد')}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Weight className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-gray-500">{getText('Current Weight', 'Poids actuel', 'الوزن الحالي')}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {latestWeight ? `${latestWeight} kg` : getText('Not recorded', 'Non enregistré', 'غير مسجل')}
                  </p>
                  {weightChange && (
                    <span className={`text-xs ${isWeightDown ? 'text-green-600' : 'text-red-600'}`}>
                      {isWeightDown ? '↓' : '↑'} {Math.abs(weightChange)} kg
                    </span>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Ruler className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-gray-500">{getText('Height', 'Taille', 'الطول')}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {user.height ? `${user.height} cm` : getText('Not set', 'Non défini', 'غير محدد')}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarDays className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-gray-500">{getText('Member Since', 'Membre depuis', 'عضو منذ')}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {user.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : getText('New', 'Nouveau', 'جديد')}
                </p>
              </div>
            </div>

            {/* BMI Display */}
            {bmi && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-600">{getText('BMI', 'IMC', 'مؤشر كتلة الجسم')}</span>
                    <span className="font-semibold text-gray-900">{bmi}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    bmiCategory?.color === 'green' ? 'bg-green-100 text-green-700' :
                    bmiCategory?.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                    bmiCategory?.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {bmiCategory?.text}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-2 md:gap-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weight Progress Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{getText('Weight Progress', 'Progression du poids', 'تقدم الوزن')}</h3>
                  <p className="text-sm text-gray-500">{getText('Last 7 days tracking', 'Suivi des 7 derniers jours', 'تتبع آخر 7 أيام')}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-gray-500 font-medium">
                    {user.weightHistory?.length || 0} {getText('records', 'enregistrements', 'سجلات')}
                  </span>
                </div>
              </div>
              {user.weightHistory?.length > 1 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formatWeightData(user.weightHistory)}>
                      <defs>
                        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} width={35} />
                      <Tooltip 
                        contentStyle={{ fontSize: '12px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value} kg`, getText('Weight', 'Poids', 'الوزن')]}
                      />
                      <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} fill="url(#weightGradient)" activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400 text-sm">{getText('No weight data yet', 'Pas encore de données', 'لا توجد بيانات وزن بعد')}</p>
                    <p className="text-xs text-gray-300 mt-1">{getText('Add weight entries to see progress', 'Ajoutez des entrées de poids pour voir la progression', 'أضف إدخالات الوزن لرؤية التقدم')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{getText('Total Workouts', 'Total entraînements', 'إجمالي التمارين')}</p>
                    <p className="text-2xl font-bold text-gray-900">{workouts?.length || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Dumbbell className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{getText('Completed Workouts', 'Entraînements complétés', 'التمارين المكتملة')}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {workouts?.filter(w => w.status === 'completed').length || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{getText('Diet Plan', 'Plan alimentaire', 'الخطة الغذائية')}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {user.dietPlan ? getText('Active', 'Actif', 'نشط') : getText('None', 'Aucun', 'لا يوجد')}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${user.dietPlan ? 'bg-green-50' : 'bg-gray-100'}`}>
                    <Apple className={`h-6 w-6 ${user.dietPlan ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{getText('Weight Entries', 'Entrées de poids', 'إدخالات الوزن')}</p>
                    <p className="text-2xl font-bold text-gray-900">{user.weightHistory?.length || 0}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workouts Tab */}
        {activeTab === 'workouts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{getText('Workout Plans', 'Plans d\'entraînement', 'خطط التمرين')}</h3>
                <p className="text-sm text-gray-500">{getText('Manage and track client workouts', 'Gérez et suivez les entraînements des clients', 'إدارة وتتبع تمارين العملاء')}</p>
              </div>
              <button 
                onClick={() => navigate(`/coach/clients/${clientId}/workout/create`)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-md flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {getText('Create Workout', 'Créer un entraînement', 'إنشاء تمرين')}
              </button>
            </div>

            {workoutsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : workouts?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workouts.map((workout) => (
                  <div key={workout._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-blue-100 rounded-lg">
                            <Dumbbell className="h-3 w-3 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900">{workout.title}</h4>
                        </div>
                        <div className="space-y-1 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(workout.scheduledDate), 'MMM dd, yyyy')}
                          </div>
                          {workout.duration && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {workout.duration} min
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                          workout.status === 'completed' ? 'bg-green-100 text-green-800' :
                          workout.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {workout.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                          {workout.status === 'scheduled' && <Clock className="h-3 w-3" />}
                          {workout.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                <Dumbbell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{getText('No workouts yet', 'Aucun entraînement', 'لا توجد تمارين بعد')}</h3>
                <p className="text-gray-500 mb-4">{getText('Create your first workout plan for this client', 'Créez votre premier plan d\'entraînement pour ce client', 'أنشئ أول خطة تمرين لهذا العميل')}</p>
                <button 
                  onClick={() => navigate(`/coach/clients/${clientId}/workout/create`)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-md inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {getText('Create Workout', 'Créer un entraînement', 'إنشاء تمرين')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Diet Tab */}
        {activeTab === 'diet' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{getText('Diet Plan', 'Plan alimentaire', 'الخطة الغذائية')}</h3>
                <p className="text-sm text-gray-500">{getText('Manage client nutrition plan', 'Gérez le plan nutritionnel du client', 'إدارة الخطة الغذائية للعميل')}</p>
              </div>
              <button 
                onClick={() => navigate(`/coach/clients/${clientId}/diet-plan/create`)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-md flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {getText('Create Diet Plan', 'Créer un plan', 'إنشاء خطة غذائية')}
              </button>
            </div>

            {user.dietPlan ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Apple className="h-5 w-5 text-white" />
                    <h4 className="font-semibold text-white">{user.dietPlan.title}</h4>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed">{user.dietPlan.description}</p>
                  {user.dietPlan.targetCalories && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-600">{getText('Target Calories', 'Calories cibles', 'السعرات المستهدفة')}:</span>
                      <span className="font-semibold text-gray-900">{user.dietPlan.targetCalories} kcal</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                <Apple className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{getText('No diet plan yet', 'Aucun plan alimentaire', 'لا توجد خطة غذائية بعد')}</h3>
                <p className="text-gray-500 mb-4">{getText('Create a personalized diet plan for this client', 'Créez un plan alimentaire personnalisé pour ce client', 'أنشئ خطة غذائية مخصصة لهذا العميل')}</p>
                <button 
                  onClick={() => navigate(`/coach/clients/${clientId}/diet-plan/create`)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-md inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {getText('Create Diet Plan', 'Créer un plan', 'إنشاء خطة غذائية')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        imageUrl={user?.profilePicture}
        name={user?.name}
      />
    </div>
  )
}

export default UserDetails