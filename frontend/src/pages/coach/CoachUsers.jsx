// src/pages/coach/CoachUsers.jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Users, Search, Filter, Eye, MessageCircle, 
  Target, Activity, Calendar, Award, ChevronRight,
  Mail, RefreshCw, CheckCircle, XCircle, AlertCircle,
  UserCheck, Dumbbell, CalendarDays, Gift, Crown, Timer
} from 'lucide-react'
import { format, differenceInDays, differenceInHours } from 'date-fns'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ProfilePictureModal from '../../components/ProfilePictureModal'

const CoachUsers = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGoal, setFilterGoal] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [imageErrors, setImageErrors] = useState({})

  const isRTL = i18n.language === 'ar'
  const isFrench = i18n.language === 'fr'

  const getText = (en, fr, ar) => {
    if (isFrench) return fr
    if (isRTL) return ar
    return en
  }

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['coachUsers'],
    queryFn: async () => {
      const response = await api.get('/coaches/users')
      console.log('Users API Response:', response.data)
      return response.data.data?.users || []
    },
  })

  const getProfilePictureUrl = (user) => {
    if (!user?.profilePicture || imageErrors[user._id]) return null
    if (user.profilePicture.startsWith('http')) {
      return user.profilePicture
    }
    return `http://localhost:5000/${user.profilePicture}`
  }

  const handleImageError = (userId) => {
    setImageErrors(prev => ({ ...prev, [userId]: true }))
  }

  // Get subscription status - FIXED: Use the subscription object from backend
  const getUserSubscriptionStatus = (user) => {
    if (!user?.subscription) return { status: 'no_plan', plan: null }
    return {
      status: user.subscription.status,
      plan: user.subscription.plan,
      price: user.subscription.price,
      endDate: user.subscription.endDate
    }
  }

  // Helper to check if user has active subscription
  const hasActiveSubscription = (user) => {
    const { status } = getUserSubscriptionStatus(user)
    return status === 'active'
  }

  // Helper to check if user is on free trial - FIXED: Only check freeTrialEnds if NO subscription
  const isOnFreeTrial = (user) => {
    if (!user) return false
    
    // If user has an active subscription, definitely NOT on free trial
    if (hasActiveSubscription(user)) return false
    
    // If user has an expired subscription, NOT on free trial
    const { status } = getUserSubscriptionStatus(user)
    if (status === 'expired') return false
    
    // Only check free trial if no subscription exists
    const trialEnds = user.freeTrialEnds
    if (!trialEnds) return false
    
    const now = new Date()
    const trialEnd = new Date(trialEnds)
    
    return trialEnd > now
  }

  const getTrialDaysLeft = (user) => {
    const trialEnds = user?.freeTrialEnds
    if (!trialEnds) return null
    const now = new Date()
    const trialEnd = new Date(trialEnds)
    if (trialEnd <= now) return 0
    return differenceInDays(trialEnd, now)
  }

  // Safe filtering
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    if (!user) return false
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = searchTerm === '' || 
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower))
    const matchesGoal = filterGoal === '' || user.goals === filterGoal
    
    let matchesStatus = true
    if (filterStatus === 'active') {
      matchesStatus = hasActiveSubscription(user)
    } else if (filterStatus === 'expired') {
      const { status } = getUserSubscriptionStatus(user)
      matchesStatus = status === 'expired'
    } else if (filterStatus === 'trial') {
      matchesStatus = isOnFreeTrial(user)
    } else if (filterStatus === 'no_plan') {
      const { status } = getUserSubscriptionStatus(user)
      matchesStatus = status === 'no_plan' && !isOnFreeTrial(user)
    }
    
    return matchesSearch && matchesGoal && matchesStatus
  }) : []

  // Stats calculation - FIXED
  const totalUsers = Array.isArray(users) ? users.length : 0
  const activeMembers = Array.isArray(users) ? users.filter(u => u && hasActiveSubscription(u)).length : 0
  const expiredMembers = Array.isArray(users) ? users.filter(u => {
    const { status } = getUserSubscriptionStatus(u)
    return status === 'expired'
  }).length : 0
  const freeTrialUsers = Array.isArray(users) ? users.filter(u => u && isOnFreeTrial(u)).length : 0

  const handleProfileClick = (client) => {
    setSelectedClient(client)
    setShowProfileModal(true)
  }

  const getLatestWeight = (user) => {
    if (!user || !user.weightHistory || user.weightHistory.length === 0) return null
    const lastEntry = user.weightHistory[user.weightHistory.length - 1]
    return lastEntry?.weight || null
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null
      return format(date, 'MMM dd, yyyy')
    } catch {
      return null
    }
  }

  const getGoalColor = (goal) => {
    switch (goal) {
      case 'weight_loss': return 'bg-blue-100 text-blue-700'
      case 'muscle_gain': return 'bg-red-100 text-red-700'
      case 'maintenance': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getGoalText = (goal) => {
    switch (goal) {
      case 'weight_loss': return getText('Weight Loss', 'Perte de poids', 'فقدان الوزن')
      case 'muscle_gain': return getText('Muscle Gain', 'Gain musculaire', 'زيادة العضلات')
      case 'maintenance': return getText('Maintenance', 'Maintien', 'الحفاظ')
      default: return getText('General', 'Général', 'عام')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
              {getText('Client Management', 'Gestion des clients', 'إدارة العملاء')}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {getText('My Clients', 'Mes Clients', 'عملائي')}
          </h1>
          <p className="text-gray-500 mt-1">
            {getText('Manage and track your clients', 'Gérez et suivez vos clients', 'إدارة وتتبع عملائك')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{getText('Total Clients', 'Clients totaux', 'إجمالي العملاء')}</p>
                <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{getText('Active Members', 'Membres actifs', 'الأعضاء النشطين')}</p>
                <p className="text-3xl font-bold text-green-600">{activeMembers}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <Crown className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{getText('Expired', 'Expiré', 'منتهي')}</p>
                <p className="text-3xl font-bold text-orange-600">{expiredMembers}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{getText('Free Trial', 'Essai gratuit', 'نسخة تجريبية')}</p>
                <p className="text-3xl font-bold text-purple-600">{freeTrialUsers}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={getText('Search by name or email...', 'Rechercher...', 'بحث...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative w-full md:w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterGoal}
                onChange={(e) => setFilterGoal(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">{getText('All Goals', 'Tous les objectifs', 'جميع الأهداف')}</option>
                <option value="weight_loss">{getText('Weight Loss', 'Perte de poids', 'فقدان الوزن')}</option>
                <option value="muscle_gain">{getText('Muscle Gain', 'Gain musculaire', 'زيادة العضلات')}</option>
                <option value="maintenance">{getText('Maintenance', 'Maintien', 'الحفاظ')}</option>
              </select>
            </div>
            <div className="relative w-full md:w-48">
              <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">{getText('All Status', 'Tous les statuts', 'جميع الحالات')}</option>
                <option value="active">{getText('Active', 'Actif', 'نشط')}</option>
                <option value="expired">{getText('Expired', 'Expiré', 'منتهي')}</option>
                <option value="trial">{getText('Free Trial', 'Essai gratuit', 'نسخة تجريبية')}</option>
                <option value="no_plan">{getText('No Plan', 'Pas de plan', 'لا توجد خطة')}</option>
              </select>
            </div>
            <button onClick={() => refetch()} className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              {getText('Refresh', 'Actualiser', 'تحديث')}
            </button>
          </div>
        </div>

        {/* Client Cards */}
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user) => {
              const latestWeight = getLatestWeight(user)
              const memberDate = formatDate(user?.createdAt)
              const { status: subscriptionStatus, plan: subscriptionPlan } = getUserSubscriptionStatus(user)
              const isActive = subscriptionStatus === 'active'
              const isExpired = subscriptionStatus === 'expired'
              const onTrial = isOnFreeTrial(user)
              const trialDaysLeft = getTrialDaysLeft(user)
              const profilePic = getProfilePictureUrl(user)
              const hasImageError = imageErrors[user._id]
              
              // Determine status display
              let statusBadge = null
              if (isActive) {
                statusBadge = (
                  <span className="px-2.5 py-1 bg-green-500/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-white flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {subscriptionPlan ? subscriptionPlan.toUpperCase() : getText('Active', 'Actif', 'نشط')}
                  </span>
                )
              } else if (isExpired) {
                statusBadge = (
                  <span className="px-2.5 py-1 bg-red-500/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-white flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {getText('Expired', 'Expiré', 'منتهي')}
                  </span>
                )
              } else if (onTrial) {
                statusBadge = (
                  <span className="px-2.5 py-1 bg-purple-500/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-white flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    {getText('Free Trial', 'Essai gratuit', 'نسخة تجريبية')}
                    {trialDaysLeft > 0 && ` ${trialDaysLeft}d`}
                  </span>
                )
              } else {
                statusBadge = (
                  <span className="px-2.5 py-1 bg-gray-500/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-white flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {getText('No Plan', 'Pas de plan', 'لا توجد خطة')}
                  </span>
                )
              }
              
              return (
                <div key={user._id} className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                  
                  {/* Header */}
                  <div className="relative h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                    <div className="absolute top-4 right-4 z-10">
                      {statusBadge}
                    </div>
                    
                    {/* Profile Picture */}
                    <div className="absolute -bottom-12 left-6">
                      <button onClick={() => handleProfileClick(user)} className="focus:outline-none">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white p-1 shadow-xl ring-4 ring-white">
                          {profilePic && !hasImageError ? (
                            <img
                              src={profilePic}
                              alt={user.name}
                              className="w-full h-full object-cover rounded-xl"
                              onError={() => handleImageError(user._id)}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                              <span className="text-3xl font-bold text-white">
                                {user?.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="pt-16 px-6 pb-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{user?.name || '—'}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3" />
                        {user?.email || '—'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-purple-500" />
                          <span className="text-xs text-gray-500">{getText('Goal', 'Objectif', 'الهدف')}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getGoalColor(user?.goals)}`}>
                          {getGoalText(user?.goals)}
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="h-4 w-4 text-orange-500" />
                          <span className="text-xs text-gray-500">{getText('Weight', 'Poids', 'الوزن')}</span>
                        </div>
                        {latestWeight ? (
                          <span className="text-base font-semibold text-gray-900">{latestWeight} kg</span>
                        ) : (
                          <span className="text-sm text-gray-400">{getText('Not recorded', 'Non enregistré', 'غير مسجل')}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {user?.height && (
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <UserCheck className="h-4 w-4 text-blue-500" />
                            <span className="text-xs text-gray-500">{getText('Height', 'Taille', 'الطول')}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{user.height} cm</span>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CalendarDays className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-gray-500">{getText('Joined', 'Inscrit', 'انضم')}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {memberDate || getText('New', 'Nouveau', 'جديد')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link to={`/clients/${user._id}`} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-xl text-center font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md flex items-center justify-center gap-2">
                        <Eye className="h-4 w-4" />
                        {getText('View Details', 'Voir détails', 'عرض التفاصيل')}
                      </Link>
                      <button onClick={() => navigate(`/messages?userId=${user._id}`)} className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-all">
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 text-center py-16">
            <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {getText('No clients found', 'Aucun client trouvé', 'لم يتم العثور على عملاء')}
            </h3>
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
    </div>
  )
}

export default CoachUsers