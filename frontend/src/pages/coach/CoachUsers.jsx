// src/pages/coach/CoachUsers.jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Users, Search, Filter, Eye, MessageCircle } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ProfilePictureModal from '../../components/ProfilePictureModal'

const CoachUsers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGoal, setFilterGoal] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const navigate = useNavigate()

  const { data: users, isLoading } = useQuery({
    queryKey: ['coachUsers'],
    queryFn: async () => {
      const response = await api.get('/coaches/users')
      return response.data.data.users
    },
  })

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGoal = !filterGoal || user.goals === filterGoal
    return matchesSearch && matchesGoal
  }) || []

  const handleProfileClick = (client) => {
    setSelectedClient(client)
    setShowProfileModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Users</h1>
          <p className="text-gray-600 mt-2">Manage and track your users' progress.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filterGoal}
                  onChange={(e) => setFilterGoal(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Goals</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="general_fitness">General Fitness</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {filteredUsers.length} of {users?.length || 0} users
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div key={user._id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    {/* Clickable Avatar */}
                    <button
                      onClick={() => handleProfileClick(user)}
                      className="focus:outline-none group relative"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center group-hover:ring-2 group-hover:ring-blue-400 transition-all">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold text-lg">
                            {user.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full px-1 hidden group-hover:block">
                        👁️
                      </span>
                    </button>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Goal:</span>
                      <span className="font-medium capitalize">
                        {user.goals?.replace('_', ' ') || 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Weight:</span>
                      <span className="font-medium">
                        {user.weightHistory?.length > 0 
                          ? `${user.weightHistory[user.weightHistory.length - 1].weight} kg`
                          : 'Not recorded'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Height:</span>
                      <span className="font-medium">
                        {user.height ? `${user.height} cm` : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subscription:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.subscription 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.subscription ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/clients/${user._id}`}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 inline mr-2" />
                      View Details
                    </Link>
                    <button
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      onClick={() => navigate(`/messages?userId=${user._id}`)}
                      aria-label={`Message ${user.name}`}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="h-16 w-16 mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterGoal ? 'No users found' : 'No users assigned'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterGoal 
                ? 'Try adjusting your search or filter criteria'
                : 'Users will appear here when assigned by admin'
              }
            </p>
          </div>
        )}
      </div>

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        imageUrl={selectedClient?.profilePicture}
        name={selectedClient?.name}
      />
    </>
  )
}

export default CoachUsers