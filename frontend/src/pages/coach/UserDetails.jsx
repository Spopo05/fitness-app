import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  User,
  Target,
  TrendingUp,
  Calendar,
  Plus,
  MessageCircle,
  Apple,
  Dumbbell
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const UserDetails = () => {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch user details
  const { data: user, isLoading: userLoading } = useQuery({
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
      return response.data.data.workouts
    },
  })

  const formatWeightData = (weightHistory) => {
    return weightHistory?.map(entry => ({
      date: format(new Date(entry.date), 'MMM dd'),
      weight: entry.weight
    })) || []
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'workouts', name: 'Workouts' },
    { id: 'diet', name: 'Diet Plan' },
  ]

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">User not found</p>
        <Link to="/clients" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
          ← Back to Users
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/clients"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <MessageCircle className="h-4 w-4 inline mr-2" />
          Send Message
        </button>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Goal</p>
                <p className="font-semibold capitalize">
                  {user.goals?.replace('_', ' ') || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Weight</p>
                <p className="font-semibold">
                  {user.weightHistory?.length > 0 
                    ? `${user.weightHistory[user.weightHistory.length - 1].weight} kg`
                    : 'Not recorded'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Height</p>
                <p className="font-semibold">
                  {user.height ? `${user.height} cm` : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Joined</p>
                <p className="font-semibold">
                  {format(new Date(user.createdAt), 'MMM yyyy')}
                </p>
              </div>
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
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weight Progress */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Progress</h3>
            {user.weightHistory?.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatWeightData(user.weightHistory)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No weight data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Workouts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workouts?.length || 0}
                  </p>
                </div>
                <Dumbbell className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Diet Plan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.dietPlan ? 'Active' : 'None'}
                  </p>
                </div>
                <Apple className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Weight Entries</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.weightHistory?.length || 0}
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'workouts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Workouts</h3>
            <button 
              onClick={() => navigate(`/coach/clients/${clientId}/workout/create`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Create Workout
            </button>
          </div>

          {workoutsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : workouts?.length > 0 ? (
            <div className="space-y-4">
              {workouts.map((workout) => (
                <div key={workout._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{workout.title}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(workout.scheduledDate), 'MMM dd, yyyy')}
                        </div>
                        {workout.duration && (
                          <span>{workout.duration} min</span>
                        )}
                        <span className="capitalize">{workout.status}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        workout.status === 'completed' ? 'bg-green-100 text-green-800' :
                        workout.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {workout.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
              <Dumbbell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No workouts created yet</p>
              <button 
                onClick={() => navigate(`/coach/clients/${clientId}/workout/create`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-4"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Create First Workout
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'diet' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Diet Plan</h3>
            <button 
              onClick={() => navigate(`/coach/clients/${clientId}/diet-plan/create`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Create Diet Plan
            </button>
          </div>

          {user.dietPlan ? (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">{user.dietPlan.title}</h4>
              <p className="text-gray-600">{user.dietPlan.description}</p>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
              <Apple className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No diet plan created yet</p>
              <button 
                onClick={() => navigate(`/coach/clients/${clientId}/diet-plan/create`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-4"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Create Diet Plan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UserDetails