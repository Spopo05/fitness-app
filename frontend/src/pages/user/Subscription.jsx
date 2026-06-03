import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { 
  CreditCard, Check, Crown, Sparkles, TrendingUp, Zap, Shield,
  Dumbbell, Apple, MessageCircle, Target, Activity, Headphones, BarChart3, Star,
  Clock, Award
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const Subscription = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedDuration, setSelectedDuration] = useState('yearly')
  const [isProcessing, setIsProcessing] = useState(false)

  const isRTL = i18n.language === 'ar'
  const isFrench = i18n.language === 'fr'

  // Get text based on language
  const getText = (en, fr, ar) => {
    if (isFrench) return fr
    if (isRTL) return ar
    return en
  }

  const { data: currentSubscription, isLoading: subscriptionLoading, refetch } = useQuery({
    queryKey: ['currentSubscription'],
    queryFn: async () => {
      try {
        const response = await api.get('/subscriptions/my-subscription')
        return response.data.data.subscription
      } catch (error) {
        if (error.response?.status === 404) return null
        throw error
      }
    },
    retry: false,
  })

  const createSubscriptionMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/subscriptions/create-checkout-session', data)
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data.message || getText('Subscription activated!', 'Abonnement activé !', 'تم تفعيل الاشتراك!'))
      queryClient.invalidateQueries(['currentSubscription'])
      setIsProcessing(false)
      setTimeout(() => navigate('/dashboard'), 2000)
    },
    onError: () => {
      toast.error(getText('Failed to activate', 'Échec de l\'activation', 'فشل التفعيل'))
      setIsProcessing(false)
    }
  })

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/subscriptions/cancel')
      return response.data
    },
    onSuccess: () => {
      refetch()
      toast.success(getText('Subscription cancelled', 'Abonnement annulé', 'تم إلغاء الاشتراك'))
    },
    onError: () => toast.error(getText('Failed to cancel', 'Échec de l\'annulation', 'فشل الإلغاء')),
  })

  const handleSubscribe = () => {
    setIsProcessing(true)
    createSubscriptionMutation.mutate({
      plan: 'premium',
      duration: selectedDuration,
    })
  }

  const formatPrice = (price) => new Intl.NumberFormat('fr-MA', { 
    style: 'currency', 
    currency: 'MAD', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)

  if (subscriptionLoading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  )

  if (currentSubscription) return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{getText('Active Subscription!', 'Abonnement Actif !', 'اشتراك نشط!')} 🎉</h2>
          <p className="text-blue-100 text-xs">{getText('You\'re enjoying all Premium benefits', 'Vous profitez de tous les avantages Premium', 'أنت تستمتع بجميع مزايا بريميوم')}</p>
        </div>
        <div className="p-5">
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500 text-xs">{getText('Plan', 'Forfait', 'الباقة')}</span>
              <span className="font-semibold text-blue-600 text-xs capitalize">Premium</span>
            </div>
            <div className="flex justify-between py-1.5 border-t border-gray-200">
              <span className="text-gray-500 text-xs">{getText('Price', 'Prix', 'السعر')}</span>
              <span className="font-semibold text-gray-900 text-xs">{formatPrice(currentSubscription.price)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-t border-gray-200">
              <span className="text-gray-500 text-xs">{getText('Renews on', 'Renouvelle le', 'يتجدد في')}</span>
              <span className="text-gray-700 text-xs">{format(new Date(currentSubscription.endDate), 'dd MMM yyyy')}</span>
            </div>
          </div>
          <button onClick={() => cancelMutation.mutate()} className="w-full py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-xs font-medium">
            {getText('Cancel Subscription', 'Annuler l\'abonnement', 'إلغاء الاشتراك')}
          </button>
        </div>
      </div>
    </div>
  )

  const monthlyPrice = 199
  const quarterlyPrice = 549
  const yearlyPrice = 2249
  const yearlySavings = (monthlyPrice * 12) - yearlyPrice
  const quarterlySavings = (monthlyPrice * 3) - quarterlyPrice

  // Features with direct text based on language
  const mainFeatures = [
    { icon: Dumbbell, text: getText('Complete access to workout programs', 'Accès complet aux programmes d\'entraînement', 'وصول كامل إلى برامج التمرين') },
    { icon: Apple, text: getText('Personalized meal plans', 'Plans alimentaires personnalisés', 'خطط غذائية مخصصة') },
    { icon: MessageCircle, text: getText('Direct messaging with coach', 'Messagerie directe avec coach', 'مراسلة مباشرة مع المدرب') },
    { icon: Target, text: getText('Personalized goals', 'Objectifs personnalisés', 'أهداف مخصصة') },
    { icon: Activity, text: getText('Advanced progress tracking', 'Suivi avancé de progression', 'تتبع متقدم للتقدم') },
    { icon: Headphones, text: getText('Priority support', 'Support prioritaire', 'دعم') },
    { icon: BarChart3, text: getText('Detailed progress reports', 'Rapports de progression détaillés', 'تقارير تقدم مفصلة') }
  ]

  const allFeatures = [
    getText('Complete access to workout programs', 'Accès complet aux programmes d\'entraînement', 'وصول كامل إلى برامج التمرين'),
    getText('Personalized meal plans', 'Plans alimentaires personnalisés', 'خطط غذائية مخصصة'),
    getText('Direct messaging with coach', 'Messagerie directe avec coach', 'مراسلة مباشرة مع المدرب'),
    getText('Personalized goals', 'Objectifs personnalisés', 'أهداف مخصصة'),
    getText('Advanced progress tracking', 'Suivi avancé de progression', 'تتبع متقدم للتقدم'),
    getText('Priority support', 'Support prioritaire', 'دعم'),
    getText('Detailed progress reports', 'Rapports de progression détaillés', 'تقارير تقدم مفصلة')
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow mb-3">
          <Crown className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-1">{getText('Premium Membership', 'Abonnement Premium', 'عضوية بريميوم')}</h1>
        <p className="text-gray-500 text-sm">{getText('Unlock your full potential', 'Libérez votre potentiel', 'أطلق العنان لإمكانياتك')}</p>
      </div>

      {/* Duration Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-xl inline-flex gap-1">
          <button
            onClick={() => setSelectedDuration('monthly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${selectedDuration === 'monthly' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'}`}
          >
            {getText('Monthly', 'Mensuel', 'شهري')} {formatPrice(monthlyPrice)}
          </button>
          <button
            onClick={() => setSelectedDuration('quarterly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${selectedDuration === 'quarterly' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'}`}
          >
            {getText('Quarterly', 'Trimestriel', 'ربع سنوي')} {formatPrice(quarterlyPrice)}
            <span className="ml-1 text-green-600 text-[10px]">-{Math.round((quarterlySavings / (monthlyPrice * 3)) * 100)}%</span>
          </button>
          <button
            onClick={() => setSelectedDuration('yearly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${selectedDuration === 'yearly' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'}`}
          >
            {getText('Yearly', 'Annuel', 'سنوي')} {formatPrice(yearlyPrice)}
            <span className="ml-1 text-green-600 text-[10px]">-{Math.round((yearlySavings / (monthlyPrice * 12)) * 100)}%</span>
            <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{getText('Best Value', 'Meilleure offre', 'أفضل قيمة')}</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Price Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 text-center">
          <h2 className="text-base font-bold text-white mb-1">{getText('Premium Access', 'Accès Premium', 'وصول بريميوم')}</h2>
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-bold text-white">
              {selectedDuration === 'monthly' ? formatPrice(monthlyPrice) : selectedDuration === 'quarterly' ? formatPrice(quarterlyPrice) : formatPrice(yearlyPrice)}
            </span>
            <span className="text-blue-200 text-xs">
              /{selectedDuration === 'monthly' ? getText('month', 'mois', 'شهر') : selectedDuration === 'quarterly' ? getText('quarter', 'trimestre', 'ربع سنة') : getText('year', 'an', 'سنة')}
            </span>
          </div>
          {selectedDuration === 'yearly' && (
            <p className="text-xs text-blue-200 mt-1">{getText('Save', 'Économisez', 'وفر')} {formatPrice(yearlySavings)}</p>
          )}
        </div>

        {/* Main Features */}
        <div className="p-4 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {mainFeatures.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="flex items-center gap-2 p-1.5">
                  <div className="w-6 h-6 flex items-center justify-center bg-blue-50 rounded-lg flex-shrink-0">
                    <Icon className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-[11px] text-gray-700 leading-tight">{feature.text}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Everything Included */}
        {/* <div className="p-4 border-b border-gray-100 bg-gray-50/30">
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="h-3.5 w-3.5 text-yellow-500" />
            <h3 className="text-xs font-semibold text-gray-900">{getText('Everything included', 'Tout est inclus', 'كل شيء مشمول')}:</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1.5">
            {allFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <Check className="h-2.5 w-2.5 text-green-500" />
                <span className="text-[10px] text-gray-600">{feature}</span>
              </div>
            ))}
          </div>
        </div> */}

        {/* CTA */}
        <div className="p-4">
          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-blue-800 transition shadow-md disabled:opacity-50"
          >
            {isProcessing ? <LoadingSpinner size="sm" /> : (
              <>
                <CreditCard className="h-3.5 w-3.5 inline mr-1.5" />
                {getText('Get Started', 'Commencer', 'ابدأ الآن')}
              </>
            )}
          </button>
          
          <div className="flex justify-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-600" />
              <span className="text-[10px] text-gray-500">{getText('Secure payment', 'Paiement sécurisé', 'دفع آمن')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-orange-600" />
              <span className="text-[10px] text-gray-500">{getText('Cancel anytime', 'Annulation à tout moment', 'إلغاء في أي وقت')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3 text-purple-600" />
              <span className="text-[10px] text-gray-500">{getText('30-day guarantee', 'Garantie 30 jours', 'ضمان 30 يوماً')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex justify-center gap-6 mt-5">
        <div className="text-center">
          <Sparkles className="mx-auto h-4 w-4 text-blue-500 mb-1" />
          <p className="text-[10px] text-gray-500">{getText('Personalized', 'Personnalisé', 'شخصي')}</p>
        </div>
        <div className="text-center">
          <Shield className="mx-auto h-4 w-4 text-blue-500 mb-1" />
          <p className="text-[10px] text-gray-500">{getText('Expert Coaches', 'Coach experts', 'مدربون خبراء')}</p>
        </div>
        <div className="text-center">
          <TrendingUp className="mx-auto h-4 w-4 text-blue-500 mb-1" />
          <p className="text-[10px] text-gray-500">{getText('Track Progress', 'Suivi progression', 'تتبع التقدم')}</p>
        </div>
        <div className="text-center">
          <Zap className="mx-auto h-4 w-4 text-blue-500 mb-1" />
          <p className="text-[10px] text-gray-500">{getText('Fast Results', 'Résultats rapides', 'نتائج سريعة')}</p>
        </div>
      </div>
    </div>
  )
}

export default Subscription