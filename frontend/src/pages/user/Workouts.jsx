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
  Award
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const Workouts = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [selectedWorkout, setSelectedWorkout] = useState(null)
  const queryClient = useQueryClient()

  // Fetch upcoming workouts
  const { data: upcomingWorkouts, isLoading: upcomingLoading } = useQuery({
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
  const { data: workoutDetails, isLoading: detailsLoading } = useQuery({
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
      queryClient.invalidateQueries(['workoutDetails'])
      queryClient.invalidateQueries(['upcomingWorkouts'])
      queryClient.invalidateQueries(['workoutHistory'])
      setSelectedWorkout(null)
      toast.success(t('workouts.workoutCompleted'))
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
    completeWorkoutMutation.mutate(selectedWorkout)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const tabs = [
    { id: 'upcoming', name: t('workouts.upcomingWorkouts'), count: upcomingWorkouts?.length || 0 },
    { id: 'history', name: t('workouts.workoutHistory'), count: workoutHistory?.length || 0 },
  ]

  // Workout Detail View
  if (selectedWorkout) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedWorkout(null)}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            ← {t('common.back')}
          </button>
        </div>

        {detailsLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : workoutDetails ? (
          <div className="space-y-6">
            {/* Workout Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{workoutDetails.title}</h1>
                  {workoutDetails.description && (
                    <p className="text-gray-600 mt-2">{workoutDetails.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(workoutDetails.scheduledDate), 'MMM dd, yyyy')}
                    </div>
                    {workoutDetails.duration && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {workoutDetails.duration} {t('workouts.minutes')}
                      </div>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(workoutDetails.difficulty)}`}>
                      {getDifficultyText(workoutDetails.difficulty)}
                    </span>
                  </div>
                </div>
                {workoutDetails.status === 'scheduled' && (
                  <button
                    onClick={handleCompleteWorkout}
                    disabled={completeWorkoutMutation.isPending}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {completeWorkoutMutation.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 inline mr-2" />
                        {t('workouts.completeWorkout')}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('workouts.progress')}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('workouts.completion')}</span>
                <span className="font-semibold">{workoutDetails.completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${workoutDetails.completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Exercises */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('workouts.exercises')}</h3>
              <div className="space-y-4">
                {workoutDetails.exercises?.map((exercise) => (
                  <div
                    key={exercise._id}
                    className={`p-4 border rounded-lg transition-colors ${
                      exercise.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => handleExerciseToggle(exercise._id, !exercise.completed)}
                          disabled={updateExerciseMutation.isPending}
                          className="mt-1"
                        >
                          {exercise.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                        <div className="flex-1">
                          <h4 className={`font-medium ${exercise.completed ? 'text-green-900' : 'text-gray-900'}`}>
                            {exercise.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>{exercise.sets} {t('workouts.sets')}</span>
                            <span>{exercise.reps} {t('workouts.reps')}</span>
                            {exercise.weight && <span>{exercise.weight} kg</span>}
                            {exercise.restTime && <span>{t('workouts.restTime')}: {exercise.restTime}s</span>}
                          </div>
                          {exercise.notes && (
                            <p className="text-sm text-gray-500 mt-2">{exercise.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {workoutDetails.notes && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('workouts.notes')}</h3>
                <p className="text-gray-600">{workoutDetails.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('workouts.notFound')}</p>
          </div>
        )}
      </div>
    )
  }

  // Main Workouts List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('workouts.title')}</h1>
        <p className="text-gray-600 mt-2">{t('workouts.subtitle')}</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('workouts.totalWorkouts')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(upcomingWorkouts?.length || 0) + (workoutHistory?.length || 0)}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('workouts.upcoming')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{upcomingWorkouts?.length || 0}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Calendar className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('workouts.completed')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{workoutHistory?.length || 0}</p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('workouts.streak')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">--</p>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : upcomingWorkouts?.length > 0 ? (
            upcomingWorkouts.map((workout) => (
              <div 
                key={workout._id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-all"
                onClick={() => setSelectedWorkout(workout._id)}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{workout.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(workout.scheduledDate), 'MMM dd, yyyy')}
                        </div>
                        {workout.duration && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {workout.duration} {t('workouts.min')}
                          </div>
                        )}
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getDifficultyColor(workout.difficulty)}`}>
                          {getDifficultyText(workout.difficulty)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    {t('workouts.start')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Target className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('workouts.noUpcoming')}</h3>
              <p className="text-gray-500">{t('workouts.coachWillAssign')}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {historyLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : workoutHistory?.length > 0 ? (
            workoutHistory.map((workout) => (
              <div 
                key={workout._id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-all"
                onClick={() => setSelectedWorkout(workout._id)}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{workout.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {t('workouts.completedOn')} {format(new Date(workout.completedDate), 'MMM dd, yyyy')}
                        </div>
                        {workout.duration && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {workout.duration} {t('workouts.min')}
                          </div>
                        )}
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getDifficultyColor(workout.difficulty)}`}>
                          {getDifficultyText(workout.difficulty)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-emerald-600">{t('workouts.completed')}</div>
                    <div className="text-xs text-gray-500">{workout.completionPercentage}% {t('workouts.done')}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('workouts.noHistory')}</h3>
              <p className="text-gray-500">{t('workouts.completeFirst')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Workouts