import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { 
  Calendar, 
  Clock, 
  Target, 
  CheckCircle, 
  Circle,
  Play,
  Filter,
  TrendingUp,
  Flame,
  Award,
  Dumbbell,
  Heart,
  Activity,
  Zap,
  ChevronRight,
  ArrowLeft,
  BarChart3,
  Star,
  Medal,
  Trophy,
  AlertCircle,
  Loader2,
  X,
  Lock
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { motion, AnimatePresence } from 'framer-motion'

const Workouts = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [selectedWorkout, setSelectedWorkout] = useState(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [workoutCompleted, setWorkoutCompleted] = useState(false) // Add this state
  const queryClient = useQueryClient()

  // Fetch upcoming workouts
  const { data: upcomingWorkouts, isLoading: upcomingLoading, refetch: refetchUpcoming } = useQuery({
    queryKey: ['upcomingWorkouts'],
    queryFn: async () => {
      const response = await api.get('/users/workouts/upcoming?limit=10')
      return response.data.data.workouts
    },
  })

  // Fetch workout history
  const { data: workoutHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['workoutHistory'],
    queryFn: async () => {
      const response = await api.get('/users/workouts/history')
      return response.data.data.workouts
    },
  })

  // Fetch workout details
  const { data: workoutDetails, isLoading: detailsLoading, refetch: refetchDetails } = useQuery({
    queryKey: ['workoutDetails', selectedWorkout],
    queryFn: async () => {
      const response = await api.get(`/workouts/${selectedWorkout}`)
      return response.data.data.workout
    },
    enabled: !!selectedWorkout,
  })

  // Update exercise mutation
  const updateExerciseMutation = useMutation({
    mutationFn: async ({ workoutId, exerciseId, data }) => {
      const response = await api.patch(`/workouts/${workoutId}/exercises/${exerciseId}`, data)
      return response.data.data.workout
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workoutDetails'])
      queryClient.invalidateQueries(['upcomingWorkouts'])
      queryClient.invalidateQueries(['workoutHistory'])
      toast.success(t('workouts.exerciseUpdated'))
      refetchDetails()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('errors.somethingWentWrong'))
    },
  })

  // Complete workout mutation
  const completeWorkoutMutation = useMutation({
    mutationFn: async (workoutId) => {
      const response = await api.patch(`/workouts/${workoutId}/complete`)
      return response.data.data.workout
    },
    onSuccess: () => {
      setWorkoutCompleted(true) // Mark as completed
      queryClient.invalidateQueries(['workoutDetails'])
      queryClient.invalidateQueries(['upcomingWorkouts'])
      queryClient.invalidateQueries(['workoutHistory'])
      toast.success(t('workouts.workoutCompleted'))
      
      // Close the workout detail view after 2 seconds
      setTimeout(() => {
        setSelectedWorkout(null)
        setWorkoutCompleted(false)
      }, 2000)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('errors.somethingWentWrong'))
    },
  })

  const handleExerciseToggle = (exerciseId, completed) => {
    updateExerciseMutation.mutate({
      workoutId: selectedWorkout,
      exerciseId,
      data: { completed }
    })
  }

  const handleCompleteWorkout = () => {
    // Prevent multiple clicks
    if (completeWorkoutMutation.isPending || workoutCompleted) {
      return
    }
    // Check if all exercises are completed
    const allExercisesCompleted = workoutDetails?.exercises?.every(ex => ex.completed)
    if (!allExercisesCompleted) {
      toast.error(t('workouts.completeAllExercisesFirst'))
      return
    }
    completeWorkoutMutation.mutate(selectedWorkout)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return <Star className="h-3 w-3" />
      case 'intermediate':
        return <Zap className="h-3 w-3" />
      case 'advanced':
        return <Trophy className="h-3 w-3" />
      default:
        return <Activity className="h-3 w-3" />
    }
  }

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return t('workouts.beginner')
      case 'intermediate':
        return t('workouts.intermediate')
      case 'advanced':
        return t('workouts.advanced')
      default:
        return difficulty
    }
  }

  const getWorkoutTypeIcon = (type) => {
    switch (type) {
      case 'strength':
        return <Dumbbell className="h-5 w-5" />
      case 'cardio':
        return <Heart className="h-5 w-5" />
      case 'hiit':
        return <Zap className="h-5 w-5" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  const tabs = [
    { id: 'upcoming', name: t('workouts.upcomingWorkouts'), icon: Calendar, count: upcomingWorkouts?.length || 0 },
    { id: 'history', name: t('workouts.workoutHistory'), icon: CheckCircle, count: workoutHistory?.length || 0 },
  ]

  const filteredUpcoming = filterDifficulty 
    ? upcomingWorkouts?.filter(w => w.difficulty === filterDifficulty)
    : upcomingWorkouts

  const filteredHistory = filterDifficulty 
    ? workoutHistory?.filter(w => w.difficulty === filterDifficulty)
    : workoutHistory

  const totalWorkouts = (upcomingWorkouts?.length || 0) + (workoutHistory?.length || 0)
  const completedCount = workoutHistory?.length || 0
  const completionRate = totalWorkouts > 0 ? Math.round((completedCount / totalWorkouts) * 100) : 0

  // Check if workout is already completed
  const isWorkoutAlreadyCompleted = workoutDetails?.status === 'completed'

  // Workout Detail View
  if (selectedWorkout) {
    const allExercisesCompleted = workoutDetails?.exercises?.every(ex => ex.completed) || false
    const canComplete = !isWorkoutAlreadyCompleted && !workoutCompleted && allExercisesCompleted && !completeWorkoutMutation.isPending
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => {
              setSelectedWorkout(null)
              setWorkoutCompleted(false)
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition" />
            {t('common.back')}
          </motion.button>

          {detailsLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : workoutDetails ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Workout Header */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="relative h-40 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">{workoutDetails.title}</h1>
                        {workoutDetails.description && (
                          <p className="text-blue-100 mt-1">{workoutDetails.description}</p>
                        )}
                      </div>
                      {!isWorkoutAlreadyCompleted && !workoutCompleted && (
                        <button
                          onClick={handleCompleteWorkout}
                          disabled={!canComplete || completeWorkoutMutation.isPending}
                          className={`px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            allExercisesCompleted
                              ? 'bg-white text-blue-600 hover:bg-gray-100'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          title={!allExercisesCompleted ? t('workouts.completeAllExercisesFirst') : ''}
                        >
                          {completeWorkoutMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : workoutCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          {workoutCompleted 
                            ? t('workouts.workoutCompleted') 
                            : allExercisesCompleted 
                              ? t('workouts.completeWorkout')
                              : t('workouts.completeExercisesFirst')}
                        </button>
                      )}
                      {isWorkoutAlreadyCompleted && (
                        <div className="px-6 py-2.5 bg-green-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-md">
                          <CheckCircle className="h-4 w-4" />
                          {t('workouts.alreadyCompleted')}
                        </div>
                      )}
                      {workoutCompleted && (
                        <div className="px-6 py-2.5 bg-green-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-md animate-pulse">
                          <CheckCircle className="h-4 w-4" />
                          {t('workouts.completedSuccess')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      {format(new Date(workoutDetails.scheduledDate), 'EEEE, MMMM dd, yyyy')}
                    </div>
                    {workoutDetails.duration && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2 text-green-500" />
                        {workoutDetails.duration} {t('workouts.minutes')}
                      </div>
                    )}
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workoutDetails.difficulty)}`}>
                      {getDifficultyIcon(workoutDetails.difficulty)}
                      {getDifficultyText(workoutDetails.difficulty)}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{t('workouts.progress')}</span>
                      <span className="text-sm font-semibold text-blue-600">{workoutDetails.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          workoutDetails.completionPercentage === 100 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-600'
                        }`}
                        style={{ width: `${workoutDetails.completionPercentage}%` }}
                      />
                    </div>
                    {workoutDetails.completionPercentage === 100 && (
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {t('workouts.allExercisesCompleted')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Exercises */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Dumbbell className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('workouts.exercises')}</h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {workoutDetails.exercises?.length} {t('workouts.exercises')}
                  </span>
                </div>
                <div className="space-y-3">
                  {workoutDetails.exercises?.map((exercise, idx) => (
                    <motion.div
                      key={exercise._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        exercise.completed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-gray-200 hover:border-blue-200'
                      } ${isWorkoutAlreadyCompleted ? 'opacity-75' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => !isWorkoutAlreadyCompleted && !workoutCompleted && handleExerciseToggle(exercise._id, !exercise.completed)}
                          disabled={isWorkoutAlreadyCompleted || workoutCompleted || updateExerciseMutation.isPending}
                          className="mt-1 flex-shrink-0 disabled:opacity-50"
                        >
                          {exercise.completed ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <Circle className={`h-6 w-6 ${isWorkoutAlreadyCompleted || workoutCompleted ? 'text-gray-300' : 'text-gray-300 hover:text-blue-500 transition'}`} />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h4 className={`font-semibold ${exercise.completed ? 'text-green-800' : 'text-gray-900'}`}>
                              {exercise.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="px-2 py-1 bg-gray-100 rounded-lg">{exercise.sets} {t('workouts.sets')}</span>
                              <span className="px-2 py-1 bg-gray-100 rounded-lg">{exercise.reps} {t('workouts.reps')}</span>
                              {exercise.weight && (
                                <span className="px-2 py-1 bg-gray-100 rounded-lg">{exercise.weight} kg</span>
                              )}
                              {exercise.restTime && (
                                <span className="px-2 py-1 bg-gray-100 rounded-lg">{exercise.restTime}s</span>
                              )}
                            </div>
                          </div>
                          {exercise.notes && (
                            <p className="text-sm text-gray-500 mt-2">{exercise.notes}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {workoutDetails.notes && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <AlertCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('workouts.notes')}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{workoutDetails.notes}</p>
                </div>
              )}

              {/* Completion Celebration */}
              {workoutCompleted && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-center text-white"
                >
                  <Trophy className="h-12 w-12 mx-auto mb-3" />
                  <h3 className="text-xl font-bold mb-2">{t('workouts.congratulations')}</h3>
                  <p>{t('workouts.workoutCompletedMessage')}</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">{t('workouts.notFound')}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main Workouts List View (keep existing code)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">{t('workouts.title')}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{t('workouts.title')}</h1>
          <p className="text-gray-500 mt-1">{t('workouts.subtitle')}</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('workouts.totalWorkouts')}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalWorkouts}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('workouts.upcoming')}</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{upcomingWorkouts?.length || 0}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('workouts.completed')}</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{completedCount}</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('workouts.completionRate')}</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{completionRate}%</p>
              </div>
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                  {tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 transition"
          >
            <Filter className="h-4 w-4" />
            {showFilter ? t('common.hideFilter') : t('common.showFilter')}
          </button>
          {filterDifficulty && (
            <button
              onClick={() => setFilterDifficulty('')}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
            >
              {getDifficultyText(filterDifficulty)}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4"
            >
              <h4 className="text-sm font-medium text-gray-900 mb-3">{t('workouts.filterByDifficulty')}</h4>
              <div className="flex gap-3">
                {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setFilterDifficulty(difficulty)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      filterDifficulty === difficulty
                        ? getDifficultyColor(difficulty)
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {getDifficultyText(difficulty)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming Workouts */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredUpcoming?.length > 0 ? (
              filteredUpcoming.map((workout, idx) => {
                const daysUntil = differenceInDays(new Date(workout.scheduledDate), new Date())
                const isToday = daysUntil === 0
                const isTomorrow = daysUntil === 1
                
                return (
                  <motion.div
                    key={workout._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                    onClick={() => setSelectedWorkout(workout._id)}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition">
                            {getWorkoutTypeIcon(workout.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{workout.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {isToday ? t('workouts.today') : isTomorrow ? t('workouts.tomorrow') : format(new Date(workout.scheduledDate), 'MMM dd, yyyy')}
                              </div>
                              {workout.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {workout.duration} min
                                </div>
                              )}
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(workout.difficulty)}`}>
                                {getDifficultyIcon(workout.difficulty)}
                                {getDifficultyText(workout.difficulty)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs text-gray-400">{t('workouts.exercises')}</div>
                            <div className="font-semibold text-gray-800">{workout.exercises?.length || 0}</div>
                          </div>
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition">
                            <ChevronRight className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                    {isToday && (
                      <div className="px-5 py-2 bg-orange-50 border-t border-orange-100">
                        <div className="flex items-center gap-2 text-xs text-orange-700">
                          <AlertCircle className="h-3 w-3" />
                          {t('workouts.todayReminder')}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('workouts.noUpcoming')}</h3>
                <p className="text-gray-500">{t('workouts.coachWillAssign')}</p>
              </div>
            )}
          </div>
        )}

        {/* Workout History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {historyLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredHistory?.length > 0 ? (
              filteredHistory.map((workout, idx) => (
                <motion.div
                  key={workout._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                  onClick={() => setSelectedWorkout(workout._id)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition">
                          <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{workout.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(workout.completedDate || workout.scheduledDate), 'MMM dd, yyyy')}
                            </div>
                            {workout.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {workout.duration} min
                              </div>
                            )}
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(workout.difficulty)}`}>
                              {getDifficultyIcon(workout.difficulty)}
                              {getDifficultyText(workout.difficulty)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-gray-400">{t('workouts.completion')}</div>
                          <div className="font-semibold text-green-600">{workout.completionPercentage}%</div>
                        </div>
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition">
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-green-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${workout.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('workouts.noHistory')}</h3>
                <p className="text-gray-500">{t('workouts.completeFirst')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Workouts