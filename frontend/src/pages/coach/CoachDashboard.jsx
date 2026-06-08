import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Users, MessageCircle, Apple, Dumbbell, CheckCircle, XCircle, Clock, 
  TrendingUp, Award, Calendar, ChevronRight, Activity, Heart, 
  Zap, Target, Sparkles, BarChart3, Star, Gift, Crown,
  UserPlus, Mail, Phone, MapPin, MoreVertical, Download,
  RefreshCw, Search, Filter, Eye, Edit, Trash2, Send,
  ArrowUpRight, ArrowDownRight, AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const CoachDashboard = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  
  const isRTL = i18n.language === 'ar'
  const isFrench = i18n.language === 'fr'

  const getText = (en, fr, ar) => {
    if (isFrench) return fr
    if (isRTL) return ar
    return en
  }
  
  // Fetch clients with diet plan status
  const { data: clientsData, isLoading: clientsLoading, refetch } = useQuery({
    queryKey: ['clientsDietStatus'],
    queryFn: async () => {
      const response = await api.get('/coaches/clients/status')
      return response.data.data
    },
  })

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
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
        return { 
          icon: <CheckCircle className="h-3 w-3" />,
          text: getText('Completed', 'Terminé', 'مكتمل'),
          color: 'bg-green-100 text-green-800 border-green-200',
          bgColor: 'bg-green-50'
        }
      case 'pending':
        return { 
          icon: <Clock className="h-3 w-3" />,
          text: getText('Pending', 'En attente', 'قيد الانتظار'),
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          bgColor: 'bg-yellow-50'
        }
      case 'expired':
        return { 
          icon: <XCircle className="h-3 w-3" />,
          text: getText('Expired', 'Expiré', 'منتهي'),
          color: 'bg-red-100 text-red-800 border-red-200',
          bgColor: 'bg-red-50'
        }
      default:
        return { 
          icon: <AlertCircle className="h-3 w-3" />,
          text: getText('No Plan', 'Pas de plan', 'لا توجد خطة'),
          color: 'bg-gray-100 text-gray-600 border-gray-200',
          bgColor: 'bg-gray-50'
        }
    }
  }

  const statCards = [
    {
      title: getText('Total Clients', 'Clients totaux', 'إجمالي العملاء'),
      value: stats.total,
      icon: Users,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: getText('Completed Today', 'Terminé aujourd\'hui', 'مكتمل اليوم'),
      value: stats.completed,
      icon: CheckCircle,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: getText('Pending', 'En attente', 'قيد الانتظار'),
      value: stats.pending,
      icon: Clock,
      color: 'yellow',
      bgGradient: 'from-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      change: '-3%',
      changeType: 'decrease'
    },
    {
      title: getText('Expired Plans', 'Plans expirés', 'الخطط المنتهية'),
      value: stats.expired,
      icon: XCircle,
      color: 'red',
      bgGradient: 'from-red-500 to-red-600',
      bgLight: 'bg-red-50',
      textColor: 'text-red-600',
      change: '+5%',
      changeType: 'increase'
    }
  ]

  // Calculate completion rate
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  const pendingRate = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                  {getText('Coach Portal', 'Portail Coach', 'بوابة المدرب')}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {getText('Welcome Back, Coach!', 'Bon retour, Coach !', 'مرحباً بعودتك أيها المدرب!')} 👋
              </h1>
              <p className="text-gray-500 mt-1">
                {getText(
                  'Track your clients\' progress and manage their diet plans',
                  'Suivez les progrès de vos clients et gérez leurs plans alimentaires',
                  'تتبع تقدم عملائك وإدارة خططهم الغذائية'
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => refetch()}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title={getText('Refresh', 'Actualiser', 'تحديث')}
              >
                <RefreshCw className="h-4 w-4 text-gray-600" />
              </button>
              <button 
                onClick={() => navigate('/clients')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {getText('Manage Clients', 'Gérer les clients', 'إدارة العملاء')}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={idx}
                className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      {stat.changeType === 'increase' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-400">
                        {getText('vs last week', 'vs semaine dernière', 'مقابل الأسبوع الماضي')}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgLight} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-5 w-5 ${stat.textColor}`} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )
          })}
        </div>

        {/* Progress Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Completion Rate Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">
                  {getText('Overall Completion Rate', 'Taux de complétion global', 'معدل الإكمال الإجمالي')}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">{completionRate}%</h3>
              </div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {getText(
                `${stats.completed} out of ${stats.total} clients completed today's plan`,
                `${stats.completed} sur ${stats.total} clients ont terminé le plan d'aujourd'hui`,
                `${stats.completed} من أصل ${stats.total} عميل أكملوا خطة اليوم`
              )}
            </p>
          </div>

          {/* Pending Rate Card */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">
                  {getText('Pending Tasks', 'Tâches en attente', 'المهام المعلقة')}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">{pendingRate}%</h3>
              </div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${pendingRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {getText(
                `${stats.pending} clients haven't eaten their plan yet`,
                `${stats.pending} clients n'ont pas encore mangé leur plan`,
                `${stats.pending} عميل لم يتناولوا خطتهم بعد`
              )}
            </p>
          </div>

          {/* Quick Action Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">
                {getText('Quick Actions', 'Actions rapides', 'إجراءات سريعة')}
              </h3>
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/clients')}
                className="w-full px-3 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition flex items-center justify-between group"
              >
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {getText('View All Clients', 'Voir tous les clients', 'عرض جميع العملاء')}
                </span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </button>
              <button 
                onClick={() => navigate('/clients')}
                className="w-full px-3 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition flex items-center justify-between group"
              >
                <span className="flex items-center gap-2">
                  <Apple className="h-4 w-4" />
                  {getText('Create Diet Plan', 'Créer un plan alimentaire', 'إنشاء خطة غذائية')}
                </span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </button>
              <button 
                onClick={() => navigate('/messages')}
                className="w-full px-3 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition flex items-center justify-between group"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {getText('Message Clients', 'Message aux clients', 'راسل العملاء')}
                </span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>
        </div>

        {/* Client Status Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {getText('Client Diet Plan Status', 'Statut du plan alimentaire des clients', 'حالة الخطة الغذائية للعملاء')}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {getText('Track which clients have eaten their diet plans', 'Suivez quels clients ont mangé leurs plans alimentaires', 'تتبع أي العملاء تناولوا خططهم الغذائية')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder={getText('Search clients...', 'Rechercher des clients...', 'ابحث عن العملاء...')}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <Filter className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
          
          {clients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {getText('Client', 'Client', 'عميل')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {getText('Diet Plan', 'Plan alimentaire', 'الخطة الغذائية')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {getText('Status', 'Statut', 'الحالة')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {getText('Eaten At', 'Mangé à', 'تم تناوله في')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {getText('Expires', 'Expire', 'تنتهي')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {getText('Actions', 'Actions', 'إجراءات')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clients.map((client) => {
                    const status = getStatusBadge(client.status)
                    return (
                      <tr key={client._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                              {client.profilePicture ? (
                                <img src={client.profilePicture} alt={client.name} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <span className="text-white font-semibold text-sm">{client.name?.charAt(0) || '?'}</span>
                              )}
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-900">{client.name}</p>
                              <p className="text-xs text-gray-500">{client.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{client.dietPlan?.title || '—'}</p>
                            {client.dietPlan?.targetCalories && (
                              <p className="text-xs text-gray-500">{client.dietPlan.targetCalories} calories</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${status.color}`}>
                            {status.icon}
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-700">
                            {client.dietPlan?.completedAt ? format(new Date(client.dietPlan.completedAt), 'MMM dd, HH:mm') : '—'}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className={`text-sm ${client.status === 'expired' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {client.dietPlan?.expiresAt ? format(new Date(client.dietPlan.expiresAt), 'MMM dd, HH:mm') : '—'}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => navigate(`/clients/${client._id}`)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title={getText('View Details', 'Voir détails', 'عرض التفاصيل')}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => navigate(`/coach/clients/${client._id}/diet-plan/create`)}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                              title={getText('Create Diet Plan', 'Créer un plan', 'إنشاء خطة غذائية')}
                            >
                              <Apple className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => navigate(`/messages?userId=${client._id}`)}
                              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                              title={getText('Send Message', 'Envoyer un message', 'إرسال رسالة')}
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {getText('No clients assigned yet', 'Aucun client assigné pour le moment', 'لا يوجد عملاء معينون بعد')}
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                {getText(
                  'Clients will appear here once they are assigned to you by the admin.',
                  'Les clients apparaîtront ici une fois qu\'ils vous seront assignés par l\'administrateur.',
                  'سيظهر العملاء هنا بمجرد تعيينهم لك من قبل المسؤول.'
                )}
              </p>
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {getText('Recent Activity', 'Activité récente', 'النشاط الأخير')}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {getText('Latest updates from your clients', 'Dernières mises à jour de vos clients', 'أحدث التحديثات من عملائك')}
              </p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              {getText('View All', 'Voir tout', 'عرض الكل')}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {clients.slice(0, 5).map((client) => (
              <div key={client._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">{client.name?.charAt(0) || '?'}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{client.name}</span>
                    {client.status === 'completed' && getText(' completed their diet plan', ' a terminé son plan alimentaire', ' أكمل خطته الغذائية')}
                    {client.status === 'pending' && getText(' hasn\'t eaten their plan yet', " n'a pas encore mangé son plan", ' لم يتناول خطته بعد')}
                    {client.status === 'expired' && getText('\'s diet plan has expired', ' le plan alimentaire a expiré', ' انتهت الخطة الغذائية')}
                    {!client.dietPlan && getText(' needs a diet plan assigned', ' a besoin d\'un plan alimentaire', ' يحتاج إلى خطة غذائية')}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {client.dietPlan?.completedAt ? format(new Date(client.dietPlan.completedAt), 'MMM dd, hh:mm a') : getText('Just now', 'À l\'instant', 'الآن')}
                  </p>
                </div>
                {client.status === 'completed' && (
                  <div className="px-2 py-1 bg-green-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                )}
                {client.status === 'pending' && (
                  <div className="px-2 py-1 bg-yellow-100 rounded-lg">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                )}
              </div>
            ))}
            {clients.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Activity className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm">
                  {getText('No recent activity', 'Aucune activité récente', 'لا يوجد نشاط حديث')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoachDashboard