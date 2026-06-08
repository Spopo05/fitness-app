import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Users, CreditCard, TrendingUp, Activity, UserCheck, Award, 
  DollarSign, Calendar, CheckCircle, UserPlus, Shield, UsersRound, 
  UserCog, Wallet, Building2, Banknote, Clock, ArrowUpRight, 
  ArrowDownRight, MoreVertical, Download, RefreshCw, 
  PieChart, BarChart3, Zap, Target, Crown, Star, ImageIcon,
  Gift, AlertCircle, XCircle, PlayCircle, BarChart
} from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  LineChart, Line, BarChart as ReBarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, 
  Pie, Cell, Area, AreaChart
} from 'recharts'

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState('month')
  const [refreshing, setRefreshing] = useState(false)
  const [imageErrors, setImageErrors] = useState({})
  const [selectedChart, setSelectedChart] = useState('subscriptions')
  const queryClient = useQueryClient()

  // Fetch free trial stats
  const { data: freeTrialStats, isLoading: trialStatsLoading } = useQuery({
    queryKey: ['freeTrialStats'],
    queryFn: async () => {
      const response = await api.get('/admin/free-trial/stats')
      return response.data.data
    },
  })

  // Fetch users
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await api.get('/admin/users?limit=100')
      console.log('Users data with profile pictures:', response.data.data.users)
      return response.data.data
    },
  })

  // Fetch subscriptions
  const { data: subscriptionsData, isLoading: subscriptionsLoading, refetch: refetchSubs } = useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: async () => {
      const response = await api.get('/admin/subscriptions?limit=100')
      return response.data.data
    },
  })

  // Fetch free trial users
  const { data: freeTrialUsers, refetch: refetchTrialUsers } = useQuery({
    queryKey: ['freeTrialUsers'],
    queryFn: async () => {
      const response = await api.get('/admin/users/free-trial?status=active')
      return response.data.data
    },
  })

  // Extend trial mutation
  const extendTrialMutation = useMutation({
    mutationFn: ({ userId, days }) => api.post(`/admin/users/${userId}/extend-trial`, { days }),
    onSuccess: () => {
      toast.success('Free trial extended successfully')
      queryClient.invalidateQueries(['freeTrialUsers'])
      queryClient.invalidateQueries(['freeTrialStats'])
      refetchTrialUsers()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to extend trial')
    }
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchUsers(), refetchSubs(), refetchTrialUsers()])
    setTimeout(() => setRefreshing(false), 500)
    toast.success('Dashboard refreshed')
  }

  const handleImageError = (userId) => {
    setImageErrors(prev => ({ ...prev, [userId]: true }))
  }

  const handleExtendTrial = (userId, days = 7) => {
    extendTrialMutation.mutate({ userId, days })
  }

  if (usersLoading || subscriptionsLoading || trialStatsLoading) {
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

  // Free trial statistics
  const activeTrials = freeTrialStats?.stats?.activeTrials || 0
  const endingSoonTrials = freeTrialStats?.stats?.endingSoon || 0
  const expiredTrials = freeTrialStats?.stats?.expiredTrials || 0

  // Helper function to get clients for a coach
  const getCoachClients = (coachId) => {
    return regularUsers.filter(user => user.coach?._id === coachId || user.coach === coachId)
  }

  // Helper function to get profile picture URL
  const getProfilePictureUrl = (user) => {
    if (user.profilePicture) {
      if (user.profilePicture.startsWith('http')) {
        return user.profilePicture
      }
      return `http://localhost:5000/${user.profilePicture}`
    }
    return null
  }
  
  // Generate chart data (mock - replace with real data from API)
  const getChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    const last6Months = months.slice(currentMonth - 5, currentMonth + 1)
    
    if (selectedChart === 'subscriptions') {
      return last6Months.map(month => ({
        name: month,
        subscriptions: Math.floor(Math.random() * 50) + 20,
        revenue: Math.floor(Math.random() * 10000) + 5000
      }))
    } else {
      return last6Months.map(month => ({
        name: month,
        users: Math.floor(Math.random() * 100) + 50,
        coaches: Math.floor(Math.random() * 20) + 5
      }))
    }
  }

  const chartData = getChartData()
  
  // Calculate growth percentages
  const userGrowth = 12.5
  const revenueGrowth = 8.3
  const subGrowth = 5.7
  const trialGrowth = 15.2

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
    },
    {
      title: 'Free Trials',
      value: activeTrials.toLocaleString(),
      change: `+${trialGrowth}%`,
      changeType: 'increase',
      icon: Gift,
      iconBg: 'bg-gradient-to-br from-pink-500 to-rose-500',
      iconColor: 'text-white',
      bgGradient: 'from-pink-50 to-white',
      borderColor: 'border-pink-100'
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

  const pieData = Object.entries(subscriptionPlans).map(([key, plan]) => ({
    name: plan.name,
    value: plan.subscribers,
    color: plan.color
  }))

  const COLORS = {
    gray: '#9CA3AF',
    blue: '#3B82F6',
    yellow: '#FBBF24',
    purple: '#8B5CF6'
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

      {/* Stats Grid - Now with 5 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
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

      {/* Free Trial Alert */}
      {endingSoonTrials > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <h4 className="font-semibold text-yellow-800">Free Trials Ending Soon</h4>
                <p className="text-sm text-yellow-700">
                  {endingSoonTrials} free trial{endingSoonTrials !== 1 ? 's' : ''} will expire in the next 3 days
                </p>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/admin/free-trials'}
              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              View Details →
            </button>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analytics Overview</h3>
              <p className="text-sm text-gray-500 mt-1">6-month trend analysis</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedChart('subscriptions')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedChart === 'subscriptions' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Subscriptions
              </button>
              <button
                onClick={() => setSelectedChart('users')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedChart === 'users' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Users
              </button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            {selectedChart === 'subscriptions' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis yAxisId="left" stroke="#888" />
                <YAxis yAxisId="right" orientation="right" stroke="#888" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="subscriptions" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                  name="New Subscriptions"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2 }}
                  name="Revenue (MAD)"
                />
              </LineChart>
            ) : (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stackId="1"
                  stroke="#3B82F6" 
                  fill="#93C5FD" 
                  fillOpacity={0.6}
                  name="Users"
                />
                <Area 
                  type="monotone" 
                  dataKey="coaches" 
                  stackId="2"
                  stroke="#8B5CF6" 
                  fill="#C4B5FD" 
                  fillOpacity={0.6}
                  name="Coaches"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Subscription Distribution Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Plan Distribution</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.color]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {Object.entries(subscriptionPlans).map(([key, plan]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${plan.color}-500`} />
                  <span className="text-gray-600">{plan.name}</span>
                </div>
                <span className="font-medium text-gray-900">{plan.subscribers} users</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscriptions by Plan Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Breakdown by Plan</h3>
              <p className="text-sm text-gray-500 mt-1">Monthly recurring revenue analysis</p>
            </div>
            <BarChart3 className="h-5 w-5 text-gray-400" />
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
                    <span className="text-sm font-semibold text-gray-900">{plan.revenue.toLocaleString()} MAD</span>
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
                  .reduce((sum, s) => sum + s.price, 0).toLocaleString()} MAD
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Average Revenue Per User (ARPU)</span>
              <span className="font-semibold text-blue-600">
                {regularUsers.length > 0 ? (totalRevenue / regularUsers.length).toFixed(2) : 0} MAD
              </span>
            </div>
          </div>
        </div>

        {/* Platform Overview Stats */}
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
                  style={{ width: `${Math.min((regularUsers.length / (coaches.length || 1) / 20) * 100, 100)}%` }}
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
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Free Trial Conversion</span>
                <span className="text-sm font-semibold text-pink-600">
                  {activeTrials > 0 ? ((activeSubscriptions / (activeTrials + activeSubscriptions)) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"
                  style={{ width: `${activeTrials > 0 ? (activeSubscriptions / (activeTrials + activeSubscriptions)) * 100 : 0}%` }}
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
            onClick={() => window.location.href = '/admin/subscriptions'}
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
                        {subscription.paymentMethod || 'Not specified'}
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
              const clientCount = getCoachClients(coach._id).length
              
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
                      <p className="text-xs text-gray-500">{clientCount} client{clientCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        {clientCount}
                      </p>
                    </div>
                    <button className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
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
          {coaches.length > 0 && (
            <button className="mt-4 w-full py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
              View All Coaches →
            </button>
          )}
        </div>

        {/* Free Trial Users Section */}
        {freeTrialUsers?.users && freeTrialUsers.users.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Free Trials</h3>
              <Gift className="h-5 w-5 text-pink-500" />
            </div>
            <div className="space-y-3">
              {freeTrialUsers.users.slice(0, 5).map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-white rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold text-lg">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      user.daysRemaining <= 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {user.daysRemaining} days left
                    </div>
                    {user.daysRemaining <= 3 && (
                      <button
                        onClick={() => handleExtendTrial(user._id, 7)}
                        className="mt-1 text-xs text-blue-600 hover:text-blue-700"
                        disabled={extendTrialMutation.isLoading}
                      >
                        Extend trial →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {endingSoonTrials > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 text-sm text-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <span>{endingSoonTrials} trial{endingSoonTrials !== 1 ? 's' : ''} ending in 3 days</span>
                </div>
              </div>
            )}
          </div>
        )}

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
                    onClick={() => window.location.href = '/admin/users'}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button 
          onClick={() => window.location.href = '/admin/users'}
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
          onClick={() => window.location.href = '/admin/subscriptions'}
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
          onClick={() => window.location.href = '/admin/free-trials'}
          className="group relative overflow-hidden bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg group-hover:scale-110 transition-transform">
              <Gift className="h-5 w-5 text-pink-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Free Trials</p>
              <p className="text-xs text-gray-500">Manage trial users</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => window.location.href = '/admin/users?role=coach'}
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