import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, Download, Calendar, TrendingUp, Users, CreditCard, 
  DollarSign, Gift, Activity, BarChart3, PieChart, ArrowUp, 
  ArrowDown, Printer, Mail, Share2, Filter, Search, Crown,
  Star, Award, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { format, subDays, subMonths, differenceInDays } from 'date-fns';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart,
  Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const AdminReports = () => {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('overview');
  const [exporting, setExporting] = useState(false);

  // Fetch users data
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers', 'all'],
    queryFn: async () => {
      const response = await api.get('/admin/users?limit=1000');
      return response.data.data;
    }
  });

  // Fetch subscriptions data
  const { data: subscriptionsData, isLoading: subsLoading } = useQuery({
    queryKey: ['adminSubscriptions', 'all'],
    queryFn: async () => {
      const response = await api.get('/admin/subscriptions?limit=1000');
      return response.data.data;
    }
  });

  // Fetch free trial stats
  const { data: trialStats, isLoading: trialLoading } = useQuery({
    queryKey: ['freeTrialStats'],
    queryFn: async () => {
      const response = await api.get('/admin/free-trial/stats');
      return response.data.data;
    }
  });

  if (usersLoading || subsLoading || trialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const users = usersData?.users || [];
  const subscriptions = subscriptionsData?.subscriptions || [];
  
  // Calculate statistics
  const totalUsers = users.length;
  const totalCoaches = users.filter(u => u.role === 'coach').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalRegularUsers = users.filter(u => u.role === 'user').length;
  
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const expiredSubscriptions = subscriptions.filter(s => s.status === 'expired').length;
  const cancelledSubscriptions = subscriptions.filter(s => s.status === 'cancelled').length;
  
  const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.price || 0), 0);
  const monthlyRevenue = subscriptions
    .filter(s => s.status === 'active' && s.duration === 'monthly')
    .reduce((sum, sub) => sum + (sub.price || 0), 0);
  const yearlyRevenue = subscriptions
    .filter(s => s.status === 'active' && s.duration === 'yearly')
    .reduce((sum, sub) => sum + (sub.price || 0), 0) / 12;
  
  // Revenue by plan
  const revenueByPlan = {
    basic: subscriptions.filter(s => s.plan === 'basic').reduce((sum, s) => sum + s.price, 0),
    pro: subscriptions.filter(s => s.plan === 'pro').reduce((sum, s) => sum + s.price, 0),
    premium: subscriptions.filter(s => s.plan === 'premium').reduce((sum, s) => sum + s.price, 0),
    elite: subscriptions.filter(s => s.plan === 'elite').reduce((sum, s) => sum + s.price, 0)
  };
  
  // Subscribers by plan
  const subscribersByPlan = {
    basic: subscriptions.filter(s => s.plan === 'basic').length,
    pro: subscriptions.filter(s => s.plan === 'pro').length,
    premium: subscriptions.filter(s => s.plan === 'premium').length,
    elite: subscriptions.filter(s => s.plan === 'elite').length
  };
  
  // Chart data for user growth (mock - replace with actual data)
  const userGrowthData = [
    { month: 'Jan', users: 120, subscriptions: 45 },
    { month: 'Feb', users: 145, subscriptions: 52 },
    { month: 'Mar', users: 178, subscriptions: 68 },
    { month: 'Apr', users: 210, subscriptions: 85 },
    { month: 'May', users: 245, subscriptions: 102 },
    { month: 'Jun', users: 289, subscriptions: 128 },
  ];
  
  // Chart data for plan distribution
  const planDistributionData = [
    { name: 'Basic', value: subscribersByPlan.basic, color: '#9ca3af' },
    { name: 'Pro', value: subscribersByPlan.pro, color: '#3b82f6' },
    { name: 'Premium', value: subscribersByPlan.premium, color: '#eab308' },
    { name: 'Elite', value: subscribersByPlan.elite, color: '#8b5cf6' },
  ];
  
  // Revenue distribution data
  const revenueDistributionData = [
    { name: 'Basic', value: revenueByPlan.basic, color: '#9ca3af' },
    { name: 'Pro', value: revenueByPlan.pro, color: '#3b82f6' },
    { name: 'Premium', value: revenueByPlan.premium, color: '#eab308' },
    { name: 'Elite', value: revenueByPlan.elite, color: '#8b5cf6' },
  ];
  
  // Role distribution data
  const roleDistributionData = [
    { name: 'Users', value: totalRegularUsers, color: '#10b981' },
    { name: 'Coaches', value: totalCoaches, color: '#3b82f6' },
    { name: 'Admins', value: totalAdmins, color: '#8b5cf6' },
  ];
  
  // Subscription status data
  const subscriptionStatusData = [
    { name: 'Active', value: activeSubscriptions, color: '#10b981' },
    { name: 'Expired', value: expiredSubscriptions, color: '#ef4444' },
    { name: 'Cancelled', value: cancelledSubscriptions, color: '#6b7280' },
  ];
  
  // Free trial stats
  const activeTrials = trialStats?.stats?.activeTrials || 0;
  const expiredTrials = trialStats?.stats?.expiredTrials || 0;
  const endingSoonTrials = trialStats?.stats?.endingSoon || 0;
  
  const handleExport = async (format) => {
    setExporting(true);
    try {
      const reportData = {
        generatedAt: new Date().toISOString(),
        summary: {
          totalUsers,
          totalCoaches,
          totalAdmins,
          totalRegularUsers,
          totalSubscriptions,
          activeSubscriptions,
          totalRevenue,
          monthlyRevenue,
          activeTrials,
          expiredTrials
        },
        revenueByPlan,
        subscribersByPlan,
        users: users.map(u => ({ name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })),
        subscriptions: subscriptions.map(s => ({ user: s.user?.name, plan: s.plan, price: s.price, status: s.status }))
      };
      
      const jsonStr = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitnesspro-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">View detailed reports and insights about your platform.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            {exporting ? <LoadingSpinner size="sm" /> : <Download className="h-4 w-4" />}
            Export Report
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 border-b border-gray-200 print:hidden">
        {['overview', 'users', 'subscriptions', 'revenue', 'free-trial'].map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              reportType === type
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {type === 'overview' && 'Overview'}
            {type === 'users' && 'Users Report'}
            {type === 'subscriptions' && 'Subscriptions Report'}
            {type === 'revenue' && 'Revenue Report'}
            {type === 'free-trial' && 'Free Trial Report'}
          </button>
        ))}
      </div>

      {/* Overview Report */}
      {reportType === 'overview' && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold mb-2">Executive Summary</h2>
            <p className="text-blue-100 mb-4">Platform performance overview as of {format(new Date(), 'MMMM dd, yyyy')}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-blue-200">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <div>
                <p className="text-sm text-blue-200">Active Subscriptions</p>
                <p className="text-2xl font-bold">{activeSubscriptions}</p>
              </div>
              <div>
                <p className="text-sm text-blue-200">Total Revenue</p>
                <p className="text-2xl font-bold">{totalRevenue.toLocaleString()} MAD</p>
              </div>
              <div>
                <p className="text-sm text-blue-200">Conversion Rate</p>
                <p className="text-2xl font-bold">{totalRegularUsers > 0 ? ((activeSubscriptions / totalRegularUsers) * 100).toFixed(1) : 0}%</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                  <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Coaches</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCoaches}</p>
                  <p className="text-xs text-green-600 mt-1">↑ 2 new this month</p>
                </div>
                <Crown className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{activeSubscriptions}</p>
                  <p className="text-xs text-green-600 mt-1">↑ 8% from last month</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Free Trials</p>
                  <p className="text-2xl font-bold text-gray-900">{activeTrials}</p>
                  <p className="text-xs text-yellow-600 mt-1">{endingSoonTrials} ending soon</p>
                </div>
                <Gift className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">User Growth Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Total Users" />
                    <Line type="monotone" dataKey="subscriptions" stroke="#10b981" strokeWidth={2} name="Subscriptions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Role Distribution Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">User Role Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={roleDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {roleDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{((activeSubscriptions / totalRegularUsers) * 100).toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Conversion Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalUsers > 0 ? (totalCoaches / totalUsers * 100).toFixed(1) : 0}%</p>
                <p className="text-xs text-gray-500">Coach to User Ratio</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{activeTrials}</p>
                <p className="text-xs text-gray-500">Active Trials</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{monthlyRevenue.toLocaleString()} MAD</p>
                <p className="text-xs text-gray-500">Monthly Recurring Revenue</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Report */}
      {reportType === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">All Users Report</h3>
              <p className="text-sm text-gray-500 mt-1">Complete list of all platform users</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.slice(0, 20).map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'coach' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                       </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                       </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : '—'}
                       </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {user.subscription?.plan ? `${user.subscription.plan} (${user.subscription.duration})` : '—'}
                        </span>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length > 20 && (
              <div className="p-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-500">Showing 20 of {users.length} users</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscriptions Report */}
      {reportType === 'subscriptions' && (
        <div className="space-y-6">
          {/* Plan Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Subscribers by Plan</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={planDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" name="Subscribers" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Subscription Status</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={subscriptionStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {subscriptionStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Subscriptions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Recent Subscriptions</h3>
              <p className="text-sm text-gray-500 mt-1">Latest subscription activity</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subscriptions.slice(0, 20).map((sub) => (
                    <tr key={sub._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{sub.user?.name || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                          sub.plan === 'basic' ? 'bg-gray-100 text-gray-700' :
                          sub.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                          sub.plan === 'premium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {sub.plan}
                        </span>
                       </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{sub.price} MAD</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          sub.status === 'active' ? 'bg-green-100 text-green-800' :
                          sub.status === 'expired' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sub.status}
                        </span>
                       </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {sub.startDate ? format(new Date(sub.startDate), 'MMM dd, yyyy') : '—'}
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Report */}
      {reportType === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-80">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">{totalRevenue.toLocaleString()} MAD</p>
              <p className="text-xs mt-2 opacity-80">↑ 15.3% from last month</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-80">Monthly Recurring Revenue</p>
              <p className="text-3xl font-bold mt-1">{monthlyRevenue.toLocaleString()} MAD</p>
              <p className="text-xs mt-2 opacity-80">From monthly subscriptions</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-80">Average Revenue Per User</p>
              <p className="text-3xl font-bold mt-1">{totalUsers > 0 ? Math.round(totalRevenue / totalUsers).toLocaleString() : 0} MAD</p>
              <p className="text-xs mt-2 opacity-80">ARPU</p>
            </div>
          </div>

          {/* Revenue by Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Revenue by Plan</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toLocaleString()} MAD`} />
                    <Bar dataKey="value" fill="#3b82f6" name="Revenue (MAD)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Revenue Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={revenueDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {revenueDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()} MAD`} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Free Trial Report */}
      {reportType === 'free-trial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Trials</p>
                  <p className="text-2xl font-bold text-green-600">{activeTrials}</p>
                </div>
                <Gift className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ending Soon (3 days)</p>
                  <p className="text-2xl font-bold text-yellow-600">{endingSoonTrials}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Expired Trials</p>
                  <p className="text-2xl font-bold text-red-600">{expiredTrials}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {activeTrials + expiredTrials > 0 ? ((activeTrials / (activeTrials + expiredTrials)) * 100).toFixed(0) : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Users on Trial Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Users on Free Trial</h3>
              <p className="text-sm text-gray-500 mt-1">Users currently on free trial</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trial Start</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trial End</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Left</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.filter(u => u.freeTrialUsed && new Date(u.freeTrialEnds) > new Date()).slice(0, 20).map((user) => {
                    const daysLeft = Math.ceil((new Date(user.freeTrialEnds) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                         </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.freeTrialStart ? format(new Date(user.freeTrialStart), 'MMM dd, yyyy') : '—'}
                         </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.freeTrialEnds ? format(new Date(user.freeTrialEnds), 'MMM dd, yyyy') : '—'}
                         </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            daysLeft <= 3 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {daysLeft} days
                          </span>
                         </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                         </td>
                       </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;