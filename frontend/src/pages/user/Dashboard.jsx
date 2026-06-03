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
  MessageCircle,
  Clock,
  User,
  ChevronRight,
  Flame,
  Trophy,
  Heart,
  Star,
  ArrowUp,
  ArrowDown,
  Zap
} from 'lucide-react'
import { format, differenceInHours } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ProfilePictureModal from '../../components/ProfilePictureModal'

const Dashboard = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedCoach, setSelectedCoach] = useState(null)
  
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
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t('dashboard.welcome')}, {user?.name?.split(' ')[0] || 'Athlete'}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">{t('dashboard.overview')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">{t('dashboard.allSystemsActive')}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('dashboard.workouts')}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{workouts?.length || 0}</p>
                <p className="text-xs text-gray-400 mt-1">{t('dashboard.upcoming')}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('dashboard.currentWeight')}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{latestWeight || '—'}</p>
                <p className="text-xs text-gray-400 mt-1">kg</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('dashboard.weightChange')}</p>
                <div className="flex items-center gap-1 mt-1">
                  {weightChange && (
                    isWeightDown ? (
                      <ArrowDown className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowUp className="h-4 w-4 text-orange-500" />
                    )
                  )}
                  <p className={`text-2xl font-bold ${isWeightDown ? 'text-green-600' : weightChange ? 'text-orange-600' : 'text-gray-900'}`}>
                    {weightChange ? `${Math.abs(weightChange)} kg` : '—'}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1">{t('dashboard.totalChange')}</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('dashboard.status')}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{currentDietPlan && !isExpired ? t('dashboard.active') : t('dashboard.inactive')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('dashboard.dietPlan')}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Apple className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weight Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{t('dashboard.weightProgress')}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{t('dashboard.last7days')}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Flame className="h-3 w-3 text-orange-500" />
                <span>{weightHistory?.length || 0} {t('dashboard.records')}</span>
              </div>
            </div>
            {weightHistory?.length > 1 ? (
              <div className="h-56">
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
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} width={30} />
                    <Tooltip 
                      contentStyle={{ fontSize: '12px', borderRadius: '10px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`${value} kg`, t('dashboard.weight')]}
                    />
                    <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} fill="url(#weightGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">{t('dashboard.noWeightData')}</p>
                  <p className="text-xs mt-1">{t('dashboard.addFirstWeight')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Workouts */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{t('dashboard.upcoming')}</h3>
              <Zap className="h-4 w-4 text-blue-500" />
            </div>
            {workouts?.length > 0 ? (
              <div className="space-y-3">
                {workouts.slice(0, 3).map((workout) => (
                  <div key={workout._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{workout.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {format(new Date(workout.scheduledDate), 'MMM dd')}
                        {workout.duration && <span>• {workout.duration} {t('dashboard.min')}</span>}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      workout.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                      workout.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {workout.difficulty === 'beginner' ? t('workouts.beginner') : 
                       workout.difficulty === 'intermediate' ? t('workouts.intermediate') : t('workouts.advanced')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">{t('dashboard.noWorkouts')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Diet Plan Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Apple className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">{t('dashboard.todaysPlan')}</h3>
              </div>
              {hasMultiplePlans && (
                <span className="text-xs text-blue-600 bg-white/50 px-2 py-0.5 rounded-full">{dietPlansCount} {t('dashboard.plans')}</span>
              )}
            </div>
            {currentDietPlan && !isExpired ? (
              <div>
                <p className="text-lg font-bold text-gray-900">{currentDietPlan.title}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {currentDietPlan.targetCalories || 'Custom'} {t('dashboard.calories')}
                </p>
                {isExpiringSoon && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                    <Clock className="h-3 w-3" />
                    {t('dashboard.expiresIn')} {hoursLeft} {t('dashboard.hours')}
                  </div>
                )}
                <button 
                  onClick={() => navigate('/diet-plan')}
                  className="mt-4 text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                  {t('dashboard.viewDetails')} <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">{t('dashboard.noDietPlan')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('dashboard.coachWillAssign')}</p>
              </div>
            )}
          </div>

          {/* Coach Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-gray-900">{t('dashboard.yourCoach')}</h3>
              </div>
              <Heart className="h-4 w-4 text-red-400" />
            </div>
            {coach ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-blue-600">
                    {coach.profilePicture ? (
                      <img src={coach.profilePicture} alt={coach.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{coach.name}</p>
                  <p className="text-xs text-gray-500">{coach.email}</p>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => navigate('/my-coach')}
                      className="text-xs text-blue-600 font-medium"
                    >
                      {t('dashboard.profile')}
                    </button>
                    <button 
                      onClick={() => navigate(`/messages?userId=${coach._id}`)}
                      className="text-xs text-gray-500 hover:text-blue-600"
                    >
                      {t('dashboard.message')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">{t('dashboard.noCoach')}</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">{t('dashboard.quickStats')}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">{t('dashboard.totalWorkouts')}</span>
                <span className="font-semibold text-gray-900">{workouts?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">{t('dashboard.totalDietPlans')}</span>
                <span className="font-semibold text-gray-900">{dietPlansCount}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">{t('dashboard.weightEntries')}</span>
                <span className="font-semibold text-gray-900">{weightHistory?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {weightHistory?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{t('dashboard.recentActivity')}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {[...weightHistory].reverse().slice(0, 4).map((entry, idx) => (
                <div key={idx} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Activity className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">{t('dashboard.weightRecorded')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-900">{entry.weight} kg</span>
                    <span className="text-xs text-gray-400">{format(new Date(entry.date), 'MMM dd')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ProfilePictureModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        imageUrl={selectedCoach?.profilePicture}
        name={selectedCoach?.name}
      />
    </>
  )
}

export default Dashboard