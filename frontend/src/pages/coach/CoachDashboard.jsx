import { useQuery } from '@tanstack/react-query'
import { Users, MessageCircle, Apple, Dumbbell, CheckCircle, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const CoachDashboard = () => {
  // Fetch clients with diet plan status
  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ['clientsDietStatus'],
    queryFn: async () => {
      const response = await api.get('/coaches/clients/status')
      return response.data.data
    },
  })

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const clients = clientsData?.clients || []
  const stats = clientsData?.stats || {
    total: 0,
    completed: 0,
    pending: 0,
    expired: 0,
    noPlan: 0
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">✓ Eaten</span>
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">⏳ Not Eaten</span>
      case 'expired':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Expired</span>
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">No Plan</span>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your clients and track their progress.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ate Their Plan</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}% of clients
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Haven't Eaten</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              <p className="text-xs text-gray-500 mt-1">Need to eat their plan</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expired Plans</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              <p className="text-xs text-gray-500 mt-1">Need new plans</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client Status Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Client Diet Plan Status</h3>
          <p className="text-sm text-gray-500 mt-1">Track which clients have eaten their diet plans</p>
        </div>
        
        {clients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diet Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eaten At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          {client.profilePicture ? (
                            <img src={client.profilePicture} alt={client.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <span className="text-blue-600 font-semibold text-sm">{client.name?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{client.dietPlan?.title || '—'}</p>
                      {client.dietPlan?.targetCalories && (
                        <p className="text-xs text-gray-500">{client.dietPlan.targetCalories} cal</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(client.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {client.dietPlan?.completedAt ? format(new Date(client.dietPlan.completedAt), 'MMM dd, HH:mm') : '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className={`text-sm ${client.status === 'expired' ? 'text-red-600' : 'text-gray-600'}`}>
                        {client.dietPlan?.expiresAt ? format(new Date(client.dietPlan.expiresAt), 'MMM dd, HH:mm') : '—'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No clients assigned yet</p>
            <p className="text-sm">Clients will appear here when assigned by admin</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => window.location.href = '/clients'}
          className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Users className="h-5 w-5 inline mr-2" />
          View All Clients
        </button>
        <button 
          onClick={() => window.location.href = '/clients'}
          className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Apple className="h-5 w-5 inline mr-2" />
          Create Diet Plan
        </button>
      </div>
    </div>
  )
}

export default CoachDashboard