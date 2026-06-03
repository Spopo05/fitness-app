import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Users, Search, Filter, Plus, Edit, Trash2, UserCheck, X, Check, Save, XCircle } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [assigningCoach, setAssigningCoach] = useState(null)
  const [selectedCoach, setSelectedCoach] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  })
  const queryClient = useQueryClient()

  // Fetch users
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['adminUsers', currentPage, searchTerm, filterRole],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(filterRole && { role: filterRole }),
      })
      const response = await api.get(`/admin/users?${params}`)
      return response.data.data
    },
  })

  // Fetch coaches for assignment dropdown
  const { data: coachesData } = useQuery({
    queryKey: ['coaches'],
    queryFn: async () => {
      const response = await api.get('/admin/coaches')
      return response.data.data
    },
  })

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await api.post('/admin/users', userData)
      return response.data
    },
    onSuccess: () => {
      toast.success('User created successfully!')
      setIsModalOpen(false)
      resetForm()
      queryClient.invalidateQueries(['adminUsers'])
      refetch()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create user')
    },
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }) => {
      const response = await api.patch(`/admin/users/${userId}`, userData)
      return response.data
    },
    onSuccess: () => {
      toast.success('User updated successfully!')
      setIsModalOpen(false)
      resetForm()
      queryClient.invalidateQueries(['adminUsers'])
      refetch()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user')
    },
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await api.delete(`/admin/users/${userId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('User deleted successfully!')
      queryClient.invalidateQueries(['adminUsers'])
      refetch()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    },
  })

  // Assign coach mutation
  const assignCoachMutation = useMutation({
    mutationFn: async ({ userId, coachId }) => {
      const response = await api.post(`/admin/users/${userId}/assign-coach`, { coachId })
      return response.data
    },
    onSuccess: () => {
      toast.success('Coach assigned successfully!')
      queryClient.invalidateQueries(['adminUsers'])
      queryClient.invalidateQueries(['coaches'])
      setAssigningCoach(null)
      setSelectedCoach('')
      refetch()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to assign coach')
    },
  })

  // Remove coach mutation
  const removeCoachMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await api.post(`/admin/users/${userId}/remove-coach`, {})
      return response.data
    },
    onSuccess: () => {
      toast.success('Coach removed successfully!')
      queryClient.invalidateQueries(['adminUsers'])
      queryClient.invalidateQueries(['coaches'])
      refetch()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove coach')
    },
  })

  const users = usersData?.users || []
  const totalPages = usersData?.pages || 1
  const coaches = coachesData?.coaches || []

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user'
    })
    setEditingUser(null)
  }

  const handleAddUser = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'user'
    })
    setIsModalOpen(true)
  }

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user._id)
    }
  }

  const handleSubmitForm = (e) => {
    e.preventDefault()
    
    if (editingUser) {
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      }
      updateUserMutation.mutate({ userId: editingUser._id, userData: updateData })
    } else {
      if (!formData.password) {
        toast.error('Password is required for new users')
        return
      }
      createUserMutation.mutate(formData)
    }
  }

  const handleAssignCoach = (user) => {
    setAssigningCoach(user)
    setSelectedCoach(user.coach?._id || '')
  }

  const handleSubmitAssign = () => {
    if (assigningCoach && selectedCoach) {
      assignCoachMutation.mutate({ 
        userId: assigningCoach._id, 
        coachId: selectedCoach 
      })
    }
  }

  const handleRemoveCoach = (user) => {
    if (window.confirm(`Remove coach from ${user.name}?`)) {
      removeCoachMutation.mutate(user._id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">Manage platform users, roles, and coach assignments.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2" onClick={handleAddUser}>
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="coach">Coach</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {usersData?.total || 0} total users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Coach</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {user.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'coach' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'user' ? (
                        <div className="flex items-center gap-2">
                          {user.coach ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-900">
                                {user.coach.name}
                              </span>
                              <button
                                onClick={() => handleRemoveCoach(user)}
                                className="text-red-600 hover:text-red-800"
                                title="Remove coach"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAssignCoach(user)}
                              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <UserCheck className="h-4 w-4" />
                              Assign Coach
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingUser ? 'Edit User' : 'Add User'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitForm}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="coach">Coach</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {(createUserMutation.isPending || updateUserMutation.isPending) ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Coach Modal */}
      {assigningCoach && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Assign Coach to {assigningCoach.name}</h2>
              <button
                onClick={() => {
                  setAssigningCoach(null)
                  setSelectedCoach('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Coach
                </label>
                <select
                  value={selectedCoach}
                  onChange={(e) => setSelectedCoach(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a coach...</option>
                  {coaches.map((coach) => (
                    <option key={coach._id} value={coach._id}>
                      {coach.name} - {coach.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setAssigningCoach(null)
                  setSelectedCoach('')
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAssign}
                disabled={!selectedCoach || assignCoachMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {assignCoachMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Assign Coach
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers