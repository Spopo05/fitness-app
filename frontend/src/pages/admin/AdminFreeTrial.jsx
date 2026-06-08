import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Users, Clock, AlertCircle, Gift, Crown, Eye, Mail, Phone, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminFreeTrial = () => {
  const [statusFilter, setStatusFilter] = useState('active');
  const queryClient = useQueryClient();
  
  // Fetch free trial users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['freeTrialUsers', statusFilter],
    queryFn: async () => {
      const response = await api.get(`/admin/users/free-trial?status=${statusFilter}&limit=100`);
      return response.data.data;
    }
  });
  
  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['freeTrialStats'],
    queryFn: async () => {
      const response = await api.get('/admin/free-trial/stats');
      return response.data.data;
    }
  });
  
  // Extend trial mutation
  const extendTrialMutation = useMutation({
    mutationFn: async ({ userId, days }) => {
      const response = await api.post(`/admin/users/${userId}/extend-trial`, { days });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Trial extended successfully!');
      queryClient.invalidateQueries(['freeTrialUsers']);
      queryClient.invalidateQueries(['freeTrialStats']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to extend trial');
    }
  });
  
  const handleExtendTrial = (userId) => {
    const days = prompt('Enter number of days to extend:', '7');
    if (days && !isNaN(days) && parseInt(days) > 0) {
      extendTrialMutation.mutate({ userId, days: parseInt(days) });
    }
  };
  
  if (usersLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  const stats = statsData?.stats || {};
  const users = usersData?.users || [];
  const endingToday = statsData?.endingToday || [];
  
  const getStatusBadge = (user) => {
    if (user.isExpired) {
      return { text: 'Expired', color: 'red' };
    }
    if (user.daysRemaining <= 3) {
      return { text: `Ending Soon (${user.daysRemaining} days)`, color: 'yellow' };
    }
    return { text: `${user.daysRemaining} days left`, color: 'green' };
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Free Trial Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage users on free trial.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Trials</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.activeTrials || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ending Soon (3 days)</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.endingSoon || 0}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expired Trials</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.expiredTrials || 0}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Free Trial Users</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalFreeTrialUsers || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Gift className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Ending Today Alert */}
      {endingToday.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-semibold text-orange-800">Trials Ending Today</h3>
              <p className="text-sm text-orange-700 mt-1">
                {endingToday.length} user{endingToday.length !== 1 ? 's' : ''} ha{endingToday.length !== 1 ? 've' : 's'} free trial ending today.
              </p>
              <div className="mt-2 space-y-1">
                {endingToday.slice(0, 3).map(user => (
                  <p key={user._id} className="text-xs text-orange-600">
                    • {user.name} ({user.email})
                  </p>
                ))}
                {endingToday.length > 3 && (
                  <p className="text-xs text-orange-600">• And {endingToday.length - 3} more...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-3">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('ending-soon')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === 'ending-soon'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Ending Soon
          </button>
          <button
            onClick={() => setStatusFilter('expired')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === 'expired'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Expired
          </button>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial Start</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <Gift className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const status = getStatusBadge(user);
                  const statusColors = {
                    green: 'bg-green-100 text-green-800',
                    yellow: 'bg-yellow-100 text-yellow-800',
                    red: 'bg-red-100 text-red-800'
                  };
                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                       </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.freeTrialStart ? new Date(user.freeTrialStart).toLocaleDateString() : '—'}
                       </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.freeTrialEnds ? new Date(user.freeTrialEnds).toLocaleDateString() : '—'}
                       </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status.color]}`}>
                          {status.text}
                        </span>
                       </td>
                      <td className="px-6 py-4">
                        {user.subscription ? (
                          <span className="text-sm text-gray-900 capitalize">{user.subscription.plan}</span>
                        ) : (
                          <span className="text-sm text-gray-400">No subscription</span>
                        )}
                       </td>
                      <td className="px-6 py-4 text-right">
                        {!user.isExpired && (
                          <button
                            onClick={() => handleExtendTrial(user._id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Extend Trial
                          </button>
                        )}
                       </td>
                     </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFreeTrial;