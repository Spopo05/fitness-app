import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Activity,
  Apple,
  Clock,
  User,
  ChevronRight,
  Flame,
  Trophy,
  Heart,
  Star,
  ArrowUp,
  ArrowDown,
  Zap,
  Sparkles,
  Award,
  Dumbbell,
  Battery,
  Crown,
  Medal
} from 'lucide-react'
import { format, differenceInHours } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ProfilePictureModal from '../../components/ProfilePictureModal'

const Dashboard = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedCoach, setSelectedCoach] = useState(null)
  const [hoveredStat, setHoveredStat] = useState(null)

  const isRTL = i18n.language === 'ar'
  const isFrench = i18n.language === 'fr'

  const getText = (en, fr, ar) => {
    if (isFrench) return fr
    if (isRTL) return ar
    return en
  }
  
  // Fetch upcoming workouts
  const { data: workouts, isLoading: workoutsLoading } = useQuery({
    queryKey: ['upcomingWorkouts'],
    queryFn: async () => {
      const response = await api.get('/users/workouts/upcoming?limit=5')
      return response.data.data.workouts
    },
  })

  // Fetch weight history
  const { data: weightHistory, isLoading: weightLoading } = useQuery({
    queryKey: ['weightHistory'],
    queryFn: async () => {
      const response = await api.get('/users/weight')
      return response.data.data.weightHistory.sort((a, b) => new Date(a.date) - new Date(b.date))
    },
  })

  // Fetch current active diet plan
  const { data: currentDietPlan, isLoading: dietPlansLoading } = useQuery({
    queryKey: ['currentDietPlan'],
    queryFn: async () => {
      try {
        const response = await api.get('/users/diet-plan/current')
        return response.data.data.dietPlan
      } catch (error) {
        if (error.response?.status === 404) return null
        throw error
      }
    },
    retry: false,
  })

  // Fetch all diet plans for count
  const { data: allDietPlans } = useQuery({
    queryKey: ['allDietPlans'],
    queryFn: async () => {
      try {
        const response = await api.get('/users/diet-plans')
        return response.data.data.dietPlans
      } catch (error) {
        return []
      }
    },
    retry: false,
  })

  // Fetch coach info
  const { data: coach } = useQuery({
    queryKey: ['coach'],
    queryFn: async () => {
      const response = await api.get('/users/coach')
      return response.data.data.coach
    },
    retry: false,
  })

  const hasMultiplePlans = allDietPlans?.length > 1
  const dietPlansCount = allDietPlans?.length || 0

  const getHoursUntilExpiration = (expiresAt) => {
    if (!expiresAt) return null
    try {
      const diffHours = differenceInHours(new Date(expiresAt), new Date())
      return diffHours
    } catch (error) {
      return null
    }
  }

  const hoursLeft = currentDietPlan ? getHoursUntilExpiration(currentDietPlan.expiresAt) : null
  const isExpiringSoon = hoursLeft !== null && hoursLeft <= 24 && hoursLeft > 0
  const isExpired = hoursLeft !== null && hoursLeft <= 0

  const latestWeight = weightHistory?.[weightHistory.length - 1]?.weight
  const firstWeight = weightHistory?.[0]?.weight
  const weightChange = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : null
  const isWeightDown = weightChange && weightChange < 0

  // Calculate BMI
  const bmi = user?.height && latestWeight ? (latestWeight / ((user.height / 100) ** 2)).toFixed(1) : null
  const getBMICategory = () => {
    if (!bmi) return null
    if (bmi < 18.5) return { text: 'Underweight', color: 'blue', icon: '🔵' }
    if (bmi < 25) return { text: 'Healthy', color: 'green', icon: '🟢' }
    if (bmi < 30) return { text: 'Overweight', color: 'yellow', icon: '🟡' }
    return { text: 'Obese', color: 'red', icon: '🔴' }
  }
  const bmiCategory = getBMICategory()

  // Calculate fitness score
  const fitnessScore = Math.min(100, Math.floor(
    (weightHistory?.length || 0) * 2 + 
    (weightChange ? (isWeightDown ? Math.abs(weightChange) * 5 : 0) : 0) + 50
  ))

  const formatWeightData = (data) => {
    return data?.slice(-7).map(entry => ({
      date: format(new Date(entry.date), 'MM/dd'),
      weight: entry.weight
    })) || []
  }

  const handleCoachClick = () => {
    if (coach) {
      setSelectedCoach(coach)
      setShowProfileModal(true)
    }
  }

  if (workoutsLoading || weightLoading || dietPlansLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const stats = [
    {
      id: 'workouts',
      title: getText('Workouts', 'Entraînements', 'التمارين'),
      value: workouts?.length || 0,
      sub: getText('Upcoming', 'À venir', 'القادمة'),
      icon: Calendar,
      bgGradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      gradient: 'from-blue-50 to-blue-100'
    },
    {
      id: 'weight',
      title: getText('Current Weight', 'Poids actuel', 'الوزن الحالي'),
      value: latestWeight || '—',
      sub: 'kg',
      icon: Target,
      bgGradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      gradient: 'from-emerald-50 to-emerald-100'
    },
    {
      id: 'change',
      title: getText('Weight Change', 'Changement', 'التغير'),
      value: weightChange ? `${Math.abs(weightChange)} kg` : '—',
      sub: getText('Total change', 'Changement total', 'التغير الكلي'),
      icon: TrendingUp,
      bgGradient: isWeightDown ? 'from-green-500 to-green-600' : 'from-orange-500 to-orange-600',
      iconBg: isWeightDown ? 'bg-green-50' : 'bg-orange-50',
      iconColor: isWeightDown ? 'text-green-500' : 'text-orange-500',
      trend: weightChange ? (isWeightDown ? 'down' : 'up') : null,
      gradient: isWeightDown ? 'from-green-50 to-green-100' : 'from-orange-50 to-orange-100'
    },
    {
      id: 'status',
      title: getText('Status', 'Statut', 'الحالة'),
      value: currentDietPlan && !isExpired ? getText('Active', 'Actif', 'نشط') : getText('Inactive', 'Inactif', 'غير نشط'),
      sub: getText('Diet Plan', 'Plan alimentaire', 'الخطة الغذائية'),
      icon: Apple,
      bgGradient: currentDietPlan && !isExpired ? 'from-amber-500 to-amber-600' : 'from-gray-400 to-gray-500',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      gradient: 'from-amber-50 to-amber-100'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative px-6 py-8 md:px-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span className="text-yellow-200 text-sm font-medium uppercase tracking-wide">
                  {getText('Welcome Back', 'Bon Retour', 'مرحباً بعودتك')}
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white">
                {user?.name?.split(' ')[0] || 'Athlete'}
              </h1>
              <p className="text-blue-100 text-sm md:text-base mt-1 max-w-md">
                {getText(
                  "Track your progress and stay on top of your fitness goals",
                  "Suivez vos progrès et restez au top de vos objectifs fitness",
                  "تتبع تقدمك وابق على اطلاع بأهدافك اللياقية"
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-green-400" />
                  <span className="text-white text-sm font-medium">Fitness Score: {fitnessScore}</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="flex items-center gap-2">
                  <Medal className="h-4 w-4 text-yellow-400" />
                  <span className="text-white text-sm font-medium">Level {Math.floor(fitnessScore / 10)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-xs text-blue-200">{getText('Workouts', 'Entraînements', 'التمارين')}</p>
              <p className="text-2xl font-bold text-white">{workouts?.length || 0}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-xs text-blue-200">{getText('Weight', 'Poids', 'الوزن')}</p>
              <p className="text-2xl font-bold text-white">{latestWeight || '—'} kg</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-xs text-blue-200">{getText('BMI', 'IMC', 'مؤشر كتلة الجسم')}</p>
              <p className="text-2xl font-bold text-white">{bmi || '—'}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-xs text-blue-200">{getText('Streak', 'Série', 'سلسلة')}</p>
              <p className="text-2xl font-bold text-white">{weightHistory?.length || 0} d</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.id}
              onMouseEnter={() => setHoveredStat(stat.id)}
              onMouseLeave={() => setHoveredStat(null)}
              className="group relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  {stat.trend && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${stat.trend === 'down' ? 'bg-green-100' : 'bg-orange-100'}`}>
                      {stat.trend === 'down' ? (
                        <ArrowDown className="h-3 w-3 text-green-600" />
                      ) : (
                        <ArrowUp className="h-3 w-3 text-orange-600" />
                      )}
                      <span className={`text-xs font-medium ${stat.trend === 'down' ? 'text-green-600' : 'text-orange-600'}`}>
                        {Math.abs(weightChange)} kg
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {getText('Weight Progress', 'Progression du poids', 'تقدم الوزن')}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {getText('Last 7 days tracking', 'Suivi des 7 derniers jours', 'تتبع آخر 7 أيام')}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-xs text-gray-500 font-medium">
                {weightHistory?.length || 0} {getText('records', 'enregistrements', 'سجلات')}
              </span>
            </div>
          </div>
          {weightHistory?.length > 1 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formatWeightData(weightHistory)}>
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
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">{getText('No weight data yet', 'Pas encore de données', 'لا توجد بيانات وزن بعد')}</p>
                <p className="text-xs text-gray-300 mt-1">{getText('Add your first weight entry', 'Ajoutez votre premier poids', 'أضف أول قياس وزن')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Workouts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {getText('Upcoming', 'À venir', 'القادمة')}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {getText('Next workouts', 'Prochains entraînements', 'التمارين القادمة')}
              </p>
            </div>
            <Zap className="h-5 w-5 text-blue-500" />
          </div>
          {workouts?.length > 0 ? (
            <div className="space-y-3">
              {workouts.slice(0, 3).map((workout, idx) => (
                <div 
                  key={workout._id} 
                  onClick={() => navigate(`/workouts`)}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                    <Dumbbell className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{workout.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {format(new Date(workout.scheduledDate), 'MMM dd')}
                      {workout.duration && <span>• {workout.duration} min</span>}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                    workout.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    workout.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {workout.difficulty === 'beginner' ? getText('Beginner', 'Débutant', 'مبتدئ') : 
                     workout.difficulty === 'intermediate' ? getText('Intermediate', 'Intermédiaire', 'متوسط') : getText('Advanced', 'Avancé', 'متقدم')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">{getText('No workouts scheduled', 'Aucun entraînement planifié', 'لا توجد تمارين مجدولة')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diet Plan Card */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 shadow-sm border border-blue-100 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Apple className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{getText("Today's Plan", 'Plan du jour', 'خطة اليوم')}</h3>
                <p className="text-xs text-gray-500">{getText('Nutrition guide', 'Guide nutritionnel', 'دليل التغذية')}</p>
              </div>
            </div>
            {hasMultiplePlans && (
              <span className="px-2 py-1 bg-white/60 rounded-full text-xs font-medium text-blue-600 shadow-sm">
                {dietPlansCount} {getText('plans', 'plans', 'خطط')}
              </span>
            )}
          </div>
          {currentDietPlan && !isExpired ? (
            <div>
              <p className="text-xl font-bold text-gray-900">{currentDietPlan.title}</p>
              <p className="text-sm text-gray-600 mt-1">
                {currentDietPlan.targetCalories || 'Custom'} {getText('calories', 'calories', 'سعرات')}
              </p>
              {isExpiringSoon && (
                <div className="mt-4 flex items-center gap-2 text-xs text-orange-600 bg-orange-50/80 px-3 py-2 rounded-lg">
                  <Clock className="h-3 w-3" />
                  <span>{getText('Expires in', 'Expire dans', 'تنتهي خلال')} {hoursLeft} {getText('hours', 'heures', 'ساعات')}</span>
                </div>
              )}
              <button 
                onClick={() => navigate('/diet-plan')}
                className="mt-5 text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all group"
              >
                {getText('View Details', 'Voir détails', 'عرض التفاصيل')}
                <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition" />
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <Apple className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">{getText('No active diet plan', 'Aucun plan actif', 'لا توجد خطة نشطة')}</p>
              <p className="text-xs text-gray-400 mt-1">{getText('Your coach will assign one', 'Votre coach vous en assignera', 'سيقوم مدربك بتعيين واحدة')}</p>
            </div>
          )}
        </div>

        {/* Coach Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{getText('Your Coach', 'Votre Coach', 'مدربك')}</h3>
                <p className="text-xs text-gray-500">{getText('Personal guidance', 'Guide personnel', 'توجيه شخصي')}</p>
              </div>
            </div>
            <Heart className="h-5 w-5 text-red-400" />
          </div>
          {coach ? (
            <div className="flex items-center gap-4 cursor-pointer" onClick={handleCoachClick}>
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-blue-600 ring-4 ring-white shadow-lg">
                  {coach.profilePicture ? (
                    <img src={coach.profilePicture} alt={coach.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-7 w-7 text-white" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-lg">{coach.name}</p>
                <p className="text-xs text-gray-500">{coach.email}</p>
                <div className="flex gap-3 mt-2">
                  <button 
                    onClick={() => navigate('/my-coach')}
                    className="text-xs text-blue-600 font-medium hover:underline"
                  >
                    {getText('Profile', 'Profil', 'الملف الشخصي')}
                  </button>
                  <button 
                    onClick={() => navigate(`/messages?userId=${coach._id}`)}
                    className="text-xs text-gray-500 hover:text-blue-600 transition"
                  >
                    {getText('Message', 'Message', 'رسالة')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <User className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">{getText('No coach assigned', 'Aucun coach assigné', 'لا يوجد مدرب معين')}</p>
              <p className="text-xs text-gray-400 mt-1">{getText('Coming soon', 'Bientôt disponible', 'قريباً')}</p>
            </div>
          )}
        </div>

        {/* Quick Stats & BMI */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{getText('Quick Stats', 'Stats rapides', 'إحصائيات سريعة')}</h3>
              <p className="text-xs text-gray-500">{getText('At a glance', 'En un coup d\'œil', 'لمحة سريعة')}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{getText('Total Workouts', 'Total entraînements', 'إجمالي التمارين')}</span>
              <span className="font-semibold text-gray-900">{workouts?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{getText('Diet Plans', 'Plans alimentaires', 'الخطط الغذائية')}</span>
              <span className="font-semibold text-gray-900">{dietPlansCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{getText('Weight Entries', 'Entrées de poids', 'إدخالات الوزن')}</span>
              <span className="font-semibold text-gray-900">{weightHistory?.length || 0}</span>
            </div>
            {bmi && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">{getText('BMI', 'IMC', 'مؤشر كتلة الجسم')}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{bmi}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-${bmiCategory?.color}-100 text-${bmiCategory?.color}-700`}>
                    {bmiCategory?.text}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {weightHistory?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">{getText('Recent Activity', 'Activité récente', 'النشاط الأخير')}</h3>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {[...weightHistory].reverse().slice(0, 5).map((entry, idx) => {
              const prevEntry = weightHistory[weightHistory.length - 1 - (idx + 1)]
              const change = prevEntry ? (entry.weight - prevEntry.weight).toFixed(1) : null
              return (
                <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition">
                      <Activity className="h-4 w-4 text-gray-500 group-hover:text-blue-500 transition" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">{getText('Weight recorded', 'Poids enregistré', 'تم تسجيل الوزن')}</span>
                      <p className="text-xs text-gray-400">{format(new Date(entry.date), 'EEEE, MMMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900 text-lg">{entry.weight} kg</span>
                    {change && (
                      <span className={`text-sm font-medium flex items-center gap-1 ${parseFloat(change) >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {parseFloat(change) >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {Math.abs(parseFloat(change))} kg
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <ProfilePictureModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        imageUrl={selectedCoach?.profilePicture}
        name={selectedCoach?.name}
      />
    </div>
  )
}

export default Dashboard