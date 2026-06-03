import { useQuery } from '@tanstack/react-query'
import { 
  Users, CreditCard, TrendingUp, Activity, UserCheck, Award, 
  DollarSign, Calendar, CheckCircle, UserPlus, Shield, UsersRound, 
  UserCog, Wallet, Building2, Banknote, Clock, ArrowUpRight, 
  ArrowDownRight, MoreVertical, Download, RefreshCw, 
  PieChart, BarChart3, Zap, Target, Crown, Star, ImageIcon
} from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useState } from 'react'

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState('month')
  const [refreshing, setRefreshing] = useState(false)
  const [imageErrors, setImageErrors] = useState({})

  // Fetch users
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await api.get('/admin/users')
      console.log('Users data with profile pictures:', response.data.data.users)
      return response.data.data
    },
  })

  // Fetch subscriptions
  const { data: subscriptionsData, isLoading: subscriptionsLoading, refetch: refetchSubs } = useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: async () => {
      const response = await api.get('/admin/subscriptions')
      return response.data.data
    },
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchUsers(), refetchSubs()])
    setTimeout(() => setRefreshing(false), 500)
  }

  const handleImageError = (userId) => {
    setImageErrors(prev => ({ ...prev, [userId]: true }))
  }

  if (usersLoading || subscriptionsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const users = usersData?.users || []
  const totalUsers = usersData?.total || 0
  const subscriptions = subscriptionsData?.subscriptions || []
  const totalSubscriptions = subscriptionsData?.total || 0
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length
  const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.price || 0), 0)
  
  const coaches = users.filter(u => u.role === 'coach')
  const regularUsers = users.filter(u => u.role === 'user')
  const unassignedUsers = regularUsers.filter(user => !user.coach)

  // Helper function to get clients for a coach
  const getCoachClients = (coachId) => {
    return regularUsers.filter(user => user.coach?._id === coachId || user.coach === coachId)
  }

  // Helper function to get profile picture URL
  const getProfilePictureUrl = (user) => {
    if (user.profilePicture) {
      // If it's a full URL, use it directly
      if (user.profilePicture.startsWith('http')) {
        return user.profilePicture
      }
      // Otherwise, prepend the backend URL
      return `http://localhost:5000/${user.profilePicture}`
    }
    return null
  }
  
  // Calculate growth percentages (mock data - replace with real calculations)
  const userGrowth = 12.5
  const revenueGrowth = 8.3
  const subGrowth = 5.7

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      change: `+${userGrowth}%`,
      changeType: 'increase',
      icon: Users,
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconColor: 'text-white',
      bgGradient: 'from-blue-50 to-white',
      borderColor: 'border-blue-100'
    },
    {
      title: 'Active Subscriptions',
      value: activeSubscriptions.toLocaleString(),
      change: `+${subGrowth}%`,
      changeType: 'increase',
      icon: CheckCircle,
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      iconColor: 'text-white',
      bgGradient: 'from-green-50 to-white',
      borderColor: 'border-green-100'
    },
    {
      title: 'Total Revenue',
      value: `${totalRevenue.toLocaleString()} MAD`,
      change: `+${revenueGrowth}%`,
      changeType: 'increase',
      icon: DollarSign,
      iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      iconColor: 'text-white',
      bgGradient: 'from-yellow-50 to-white',
      borderColor: 'border-yellow-100'
    },
    {
      title: 'Active Coaches',
      value: coaches.length.toLocaleString(),
      change: coaches.length > 0 ? '+2' : '0',
      changeType: coaches.length > 0 ? 'increase' : 'neutral',
      icon: UserCheck,
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconColor: 'text-white',
      bgGradient: 'from-purple-50 to-white',
      borderColor: 'border-purple-100'
    }
  ]

  const subscriptionPlans = {
    basic: { 
      name: 'Basic', 
      price: 49, 
      color: 'gray',
      subscribers: subscriptions.filter(s => s.plan === 'basic').length,
      revenue: subscriptions.filter(s => s.plan === 'basic').reduce((sum, s) => sum + s.price, 0),
      icon: Wallet
    },
    pro: { 
      name: 'Pro', 
      price: 99, 
      color: 'blue',
      subscribers: subscriptions.filter(s => s.plan === 'pro').length,
      revenue: subscriptions.filter(s => s.plan === 'pro').reduce((sum, s) => sum + s.price, 0),
      icon: Zap
    },
    premium: { 
      name: 'Premium', 
      price: 149, 
      color: 'yellow',
      subscribers: subscriptions.filter(s => s.plan === 'premium').length,
      revenue: subscriptions.filter(s => s.plan === 'premium').reduce((sum, s) => sum + s.price, 0),
      icon: Star
    },
    elite: { 
      name: 'Elite', 
      price: 249, 
      color: 'purple',
      subscribers: subscriptions.filter(s => s.plan === 'elite').length,
      revenue: subscriptions.filter(s => s.plan === 'elite').reduce((sum, s) => sum + s.price, 0),
      icon: Crown
    }
  }

  const getColorClasses = (color) => {
    const colors = {
      gray: 'from-gray-500 to-gray-600',
      blue: 'from-blue-500 to-blue-600',
      yellow: 'from-yellow-500 to-yellow-600',
      purple: 'from-purple-500 to-purple-600'
    }
    return colors[color]
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your platform today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-all ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} rounded-2xl border ${stat.borderColor} p-5 hover:shadow-lg transition-all duration-300 group`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center gap-1">
                  {stat.changeType === 'increase' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-400">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscriptions by Plan */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Subscriptions by Plan</h3>
              <p className="text-sm text-gray-500 mt-1">Distribution of active subscriptions</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Last 30 days</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {Object.entries(subscriptionPlans).map(([key, plan]) => (
              <div key={key} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${getColorClasses(plan.color)} bg-opacity-10`}>
                      <plan.icon className={`h-3 w-3 text-${plan.color}-600`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{plan.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{plan.subscribers} subscribers</span>
                    <span className="text-sm font-semibold text-gray-900">{plan.revenue} MAD</span>
                  </div>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getColorClasses(plan.color)} rounded-full transition-all duration-500 group-hover:opacity-90`}
                    style={{ 
                      width: `${totalSubscriptions > 0 ? (plan.subscribers / totalSubscriptions) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total Active Subscriptions</span>
              <span className="font-semibold text-gray-900">{activeSubscriptions}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Monthly Recurring Revenue (MRR)</span>
              <span className="font-semibold text-green-600">
                {subscriptions
                  .filter(s => s.status === 'active' && s.duration === 'monthly')
                  .reduce((sum, s) => sum + s.price, 0)} MAD
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Platform Overview</h3>
            <Target className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Users without coach</span>
                <span className="text-sm font-semibold text-orange-600">{unassignedUsers.length}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                  style={{ width: `${regularUsers.length > 0 ? (unassignedUsers.length / regularUsers.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Coach to User Ratio</span>
                <span className="text-sm font-semibold text-purple-600">
                  {coaches.length > 0 ? (regularUsers.length / coaches.length).toFixed(1) : 0}:1
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"
                  style={{ width: `${coaches.length > 0 ? (regularUsers.length / coaches.length / 10) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Subscription Conversion</span>
                <span className="text-sm font-semibold text-green-600">
                  {regularUsers.length > 0 ? ((activeSubscriptions / regularUsers.length) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                  style={{ width: `${regularUsers.length > 0 ? (activeSubscriptions / regularUsers.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <p className="text-sm text-gray-500 mt-1">Latest subscription activity and payments</p>
          </div>
          <button 
            onClick={() => window.location.href = '/subscriptions'}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            View All Transactions →
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscriptions.slice(0, 5).map((subscription) => (
                <tr key={subscription._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-semibold text-sm">
                          {subscription.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.user?.name || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {subscription.user?.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                      subscription.plan === 'basic' ? 'bg-gray-100 text-gray-700' :
                      subscription.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                      subscription.plan === 'premium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {subscription.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {subscription.price} MAD
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {subscription.duration}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                      subscription.status === 'expired' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        subscription.status === 'active' ? 'bg-green-500' :
                        subscription.status === 'expired' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} />
                      {subscription.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600 capitalize">
                        {subscription.paymentMethod}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subscription.createdAt ? new Date(subscription.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    No transactions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section - Coaches & Unassigned Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Coaches */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Coaches</h3>
            <UserCheck className="h-5 w-5 text-purple-500" />
          </div>
          <div className="space-y-4">
            {coaches.slice(0, 5).map((coach) => {
              const profilePic = getProfilePictureUrl(coach)
              const hasError = imageErrors[coach._id]
              
              return (
                <div key={coach._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {profilePic && !hasError ? (
                      <img 
                        src={profilePic} 
                        alt={coach.name}
                        className="w-10 h-10 rounded-full object-cover shadow-sm"
                        onError={() => handleImageError(coach._id)}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-semibold text-lg">
                          {coach.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{coach.name}</p>
                      <p className="text-xs text-gray-500">{getCoachClients(coach._id).length} clients</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      {getCoachClients(coach._id).length} clients
                    </p>
                  </div>
                </div>
              )
            })}
            {coaches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                No coaches assigned yet
              </div>
            )}
          </div>
        </div>

        {/* Unassigned Users Alert */}
        {unassignedUsers.length > 0 && (
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200 p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <UserCog className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800">Users Need Coach Assignment</h3>
                <p className="text-sm text-orange-600 mt-1">
                  {unassignedUsers.length} user{unassignedUsers.length !== 1 ? 's' : ''} don't have a coach assigned
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <button 
                    onClick={() => window.location.href = '/users'}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    Assign Now
                  </button>
                  <span className="text-xs text-orange-500">
                    ⚡ Immediate action required
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => window.location.href = '/users'}
          className="group relative overflow-hidden bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Manage Users</p>
              <p className="text-xs text-gray-500">Add, edit, or remove users</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => window.location.href = '/subscriptions'}
          className="group relative overflow-hidden bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg group-hover:scale-110 transition-transform">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Manage Subscriptions</p>
              <p className="text-xs text-gray-500">View and manage all subscriptions</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => window.location.href = '/users?role=coach'}
          className="group relative overflow-hidden bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform">
              <UserCheck className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Manage Coaches</p>
              <p className="text-xs text-gray-500">View and manage coaching staff</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

export default AdminDashboard