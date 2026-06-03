import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  CreditCard, Search, Filter, Plus, Eye, X, Check, DollarSign, 
  Calendar, Clock, Wallet, Landmark, Building2, Banknote, TrendingUp 
} from 'lucide-react'
import { format } from 'date-fns'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminSubscriptions = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPlan, setFilterPlan] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [formData, setFormData] = useState({
    userId: '',
    plan: 'pro',
    duration: 'monthly',
    paymentMethod: 'card'
  })
  const [users, setUsers] = useState([])
  const queryClient = useQueryClient()

  // Fetch subscriptions
  const { data: subscriptionsData, isLoading, refetch } = useQuery({
    queryKey: ['adminSubscriptions', currentPage, filterStatus, filterPlan],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filterStatus && { status: filterStatus }),
        ...(filterPlan && { plan: filterPlan }),
      })
      const response = await api.get(`/admin/subscriptions?${params}`)
      return response.data.data
    },
  })

  // Fetch users for dropdown
  const { data: usersData } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const response = await api.get('/admin/users?limit=100')
      return response.data.data
    },
  })

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/admin/subscriptions', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Subscription created successfully!')
      setIsModalOpen(false)
      resetForm()
      queryClient.invalidateQueries(['adminSubscriptions'])
      refetch()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create subscription')
    },
  })

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`/admin/subscriptions/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Subscription updated successfully!')
      setIsModalOpen(false)
      setSelectedSubscription(null)
      resetForm()
      queryClient.invalidateQueries(['adminSubscriptions'])
      refetch()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update subscription')
    },
  })

  const subscriptions = subscriptionsData?.subscriptions || []
  const totalPages = subscriptionsData?.pages || 1
  const allUsers = usersData?.users || []

  // Plan configurations in MAD
  const plans = {
    basic: { name: 'Basic', price: { monthly: 49, quarterly: 129, yearly: 499 } },
    pro: { name: 'Pro', price: { monthly: 99, quarterly: 269, yearly: 999 } },
    premium: { name: 'Premium', price: { monthly: 149, quarterly: 399, yearly: 1499 } },
    elite: { name: 'Elite', price: { monthly: 249, quarterly: 699, yearly: 2499 } }
  }

  const resetForm = () => {
    setFormData({
      userId: '',
      plan: 'pro',
      duration: 'monthly',
      paymentMethod: 'card'
    })
  }

  const handleAddSubscription = () => {
    resetForm()
    setSelectedSubscription(null)
    setIsModalOpen(true)
  }

  const handleViewSubscription = (subscription) => {
    setSelectedSubscription(subscription)
    setFormData({
      userId: subscription.user?._id || subscription.user,
      plan: subscription.plan,
      duration: subscription.duration,
      paymentMethod: subscription.paymentMethod
    })
    setIsModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (selectedSubscription) {
      updateSubscriptionMutation.mutate({
        id: selectedSubscription._id,
        data: {
          status: formData.status,
          endDate: formData.endDate,
          autoRenew: formData.autoRenew
        }
      })
    } else {
      createSubscriptionMutation.mutate(formData)
    }
  }

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'basic': return 'bg-gray-100 text-gray-800'
      case 'pro': return 'bg-blue-100 text-blue-800'
      case 'premium': return 'bg-yellow-100 text-yellow-800'
      case 'elite': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card': return <CreditCard className="h-4 w-4" />
      case 'cih': return <Building2 className="h-4 w-4" />
      case 'attijari': return <Landmark className="h-4 w-4" />
      case 'bmce': return <Building2 className="h-4 w-4" />
      case 'cash': return <Banknote className="h-4 w-4" />
      default: return <Wallet className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600 mt-2">Manage user subscriptions and billing in Moroccan Dirham (MAD).</p>
        </div>
        <button 
          onClick={handleAddSubscription}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Subscription
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptions.reduce((sum, sub) => sum + (sub.price || 0), 0)} MAD
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-green-600">
                {subscriptions.filter(s => s.status === 'active').length}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Recurring</p>
              <p className="text-2xl font-bold text-blue-600">
                {subscriptions
                  .filter(s => s.status === 'active' && s.duration === 'monthly')
                  .reduce((sum, sub) => sum + (sub.price || 0), 0)} MAD
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Subscription Value</p>
              <p className="text-2xl font-bold text-orange-600">
                {subscriptions.length > 0 
                  ? Math.round(subscriptions.reduce((sum, sub) => sum + (sub.price || 0), 0) / subscriptions.length)
                  : 0} MAD
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Plans</option>
                <option value="basic">Basic - 49 MAD</option>
                <option value="pro">Pro - 99 MAD</option>
                <option value="premium">Premium - 149 MAD</option>
                <option value="elite">Elite - 249 MAD</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {subscriptionsData?.total || 0} total subscriptions
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                subscriptions.map((subscription) => (
                  <tr key={subscription._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {subscription.user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.user?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subscription.user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${getPlanColor(subscription.plan)}`}>
                        {subscription.plan}
                      </span>
                      <div className="text-xs text-gray-500 mt-1 capitalize">
                        {subscription.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.price} MAD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {getPaymentMethodIcon(subscription.paymentMethod)}
                        <span className="text-sm text-gray-600 capitalize">
                          {subscription.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscription.endDate ? format(new Date(subscription.endDate), 'MMM dd, yyyy') : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleViewSubscription(subscription)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
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
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedSubscription ? 'Subscription Details' : 'Create Subscription'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedSubscription(null)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {!selectedSubscription ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                      <select
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select user...</option>
                        {allUsers.filter(u => u.role === 'user').map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name} - {user.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                      <select
                        value={formData.plan}
                        onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(plans).map(([key, plan]) => (
                          <option key={key} value={key}>
                            {plan.name} - Starting from {plan.price.monthly} MAD/month
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <select
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly (Save 10%)</option>
                        <option value="yearly">Yearly (Save 20%)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="card">Credit Card</option>
                        <option value="cih">CIH Bank</option>
                        <option value="attijari">Attijari Bank</option>
                        <option value="bmce">BMCE Bank</option>
                        <option value="cash">Cash</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-800">
                      <strong>Price:</strong> {plans[formData.plan]?.price[formData.duration]} MAD / {formData.duration}
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm"><strong>User:</strong> {selectedSubscription.user?.name}</p>
                    <p className="text-sm mt-1"><strong>Plan:</strong> {selectedSubscription.plan} ({selectedSubscription.duration})</p>
                    <p className="text-sm mt-1"><strong>Price:</strong> {selectedSubscription.price} MAD</p>
                    <p className="text-sm mt-1"><strong>Payment:</strong> {selectedSubscription.paymentMethod}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Auto Renew</label>
                    <select
                      value={formData.autoRenew}
                      onChange={(e) => setFormData({ ...formData, autoRenew: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setSelectedSubscription(null)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {(createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending) ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {selectedSubscription ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSubscriptions