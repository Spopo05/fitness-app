import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { 
  CreditCard, Check, Crown, Sparkles, TrendingUp, Zap, Shield,
  Dumbbell, Apple, MessageCircle, Target, Activity, Headphones, BarChart3, Star,
  Clock, Award, Gift, AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const Subscription = () => {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedPlan, setSelectedPlan] = useState('basic')
  const [selectedDuration, setSelectedDuration] = useState('monthly')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card')
  const [useFreeTrial, setUseFreeTrial] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const isRTL = i18n.language === 'ar'
  const isFrench = i18n.language === 'fr'

  const getText = (en, fr, ar) => {
    if (isFrench) return fr
    if (isRTL) return ar
    return en
  }

  // Fetch current subscription
  const { data: currentSubscription, isLoading: subscriptionLoading, refetch } = useQuery({
    queryKey: ['currentSubscription'],
    queryFn: async () => {
      try {
        const response = await api.get('/subscriptions/current')
        return response.data.data.subscription
      } catch (error) {
        if (error.response?.status === 404) return null
        throw error
      }
    },
    retry: false,
  })

  // ✅ Check if user has already used free trial
  const { data: freeTrialStatus, isLoading: freeTrialLoading } = useQuery({
    queryKey: ['freeTrialStatus'],
    queryFn: async () => {
      try {
        const response = await api.get('/subscriptions/can-start-free-trial')
        return response.data.data
      } catch {
        return { canStartFreeTrial: false, hasUsedFreeTrial: false }
      }
    },
  })

  // Fetch plans
  const { data: plansData } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const response = await api.get('/subscriptions/plans')
      return response.data.data
    },
  })

  const hasUsedFreeTrial = freeTrialStatus?.hasUsedFreeTrial === true
  const canUseFreeTrial = freeTrialStatus?.canStartFreeTrial === true

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/subscriptions/create', {
        ...data,
        useFreeTrial: useFreeTrial && selectedPlan === 'basic'
      })
      return response.data
    },
    onSuccess: () => {
      toast.success(useFreeTrial 
        ? getText('Free trial started! You have 7 days free!', 'Essai gratuit commencé ! Vous avez 7 jours gratuits !', 'بدأت النسخة التجريبية المجانية! لديك 7 أيام مجانية!')
        : getText('Subscription activated!', 'Abonnement activé !', 'تم تفعيل الاشتراك!'))
      queryClient.invalidateQueries(['currentSubscription'])
      queryClient.invalidateQueries(['freeTrialStatus'])
      setIsProcessing(false)
      refetch()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || getText('Failed to activate', 'Échec de l\'activation', 'فشل التفعيل'))
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
      planId: selectedPlan,
      duration: selectedDuration,
      paymentMethod: selectedPaymentMethod,
    })
  }

  const formatPrice = (price) => new Intl.NumberFormat('fr-MA', { 
    style: 'currency', 
    currency: 'MAD', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)

  const plans = plansData?.plans || []
  const selectedPlanData = plans.find(p => p.id === selectedPlan)

  if (subscriptionLoading || freeTrialLoading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  )

  // Show active subscription
  if (currentSubscription && currentSubscription.isActive) return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{getText('Active Subscription!', 'Abonnement Actif !', 'اشتراك نشط!')} 🎉</h2>
          <p className="text-blue-100 text-xs">{getText(`You're enjoying all ${currentSubscription.plan} benefits`, `Vous profitez de tous les avantages ${currentSubscription.plan}`, `أنت تستمتع بجميع مزايا ${currentSubscription.plan}`)}</p>
        </div>
        <div className="p-5">
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500 text-xs">{getText('Plan', 'Forfait', 'الباقة')}</span>
              <span className="font-semibold text-blue-600 text-xs capitalize">{currentSubscription.plan}</span>
            </div>
            <div className="flex justify-between py-1.5 border-t border-gray-200">
              <span className="text-gray-500 text-xs">{getText('Price', 'Prix', 'السعر')}</span>
              <span className="font-semibold text-gray-900 text-xs">{formatPrice(currentSubscription.price)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-t border-gray-200">
              <span className="text-gray-500 text-xs">{getText('Expires on', 'Expire le', 'ينتهي في')}</span>
              <span className="text-gray-700 text-xs">{format(new Date(currentSubscription.endDate), 'dd MMM yyyy')}</span>
            </div>
            <div className="flex justify-between py-1.5 border-t border-gray-200">
              <span className="text-gray-500 text-xs">{getText('Days remaining', 'Jours restants', 'الأيام المتبقية')}</span>
              <span className="text-gray-700 text-xs">{currentSubscription.daysRemaining} days</span>
            </div>
          </div>
          <button onClick={() => cancelMutation.mutate()} className="w-full py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-xs font-medium">
            {getText('Cancel Subscription', 'Annuler l\'abonnement', 'إلغاء الاشتراك')}
          </button>
        </div>
      </div>
    </div>
  )

  const currentPrice = selectedPlanData?.prices?.[selectedDuration]?.amount || 0
  const savings = selectedPlanData?.prices?.[selectedDuration]?.savings || 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow mb-3">
          <Crown className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-1">{getText('Premium Membership', 'Abonnement Premium', 'عضوية بريميوم')}</h1>
        <p className="text-gray-500 text-sm">{getText('Choose your plan', 'Choisissez votre forfait', 'اختر باقتك')}</p>
      </div>

      {/* ✅ Free Trial Banner - ONLY SHOW if user has NOT used free trial */}
      {!hasUsedFreeTrial && canUseFreeTrial && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Gift className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800">{getText('🎁 7-Day Free Trial Available!', '🎁 Essai gratuit de 7 jours disponible !', '🎁 نسخة تجريبية مجانية لمدة 7 أيام متاحة!')}</h3>
              <p className="text-sm text-green-700 mt-1">
                {getText(
                  'Try the Basic plan free for 7 days. No commitment, cancel anytime!',
                  'Essayez le plan Basic gratuitement pendant 7 jours. Sans engagement, annulez à tout moment !',
                  'جرب الخطة الأساسية مجاناً لمدة 7 أيام. بدون التزام، يمكنك الإلغاء في أي وقت!'
                )}
              </p>
              <button
                onClick={() => {
                  setSelectedPlan('basic')
                  setUseFreeTrial(true)
                }}
                className="mt-2 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
              >
                {getText('Claim Free Trial', 'Profiter de l\'essai gratuit', 'احصل على النسخة التجريبية المجانية')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => {
              setSelectedPlan(plan.id)
              setUseFreeTrial(false)
            }}
            className={`p-3 rounded-xl border-2 transition-all ${
              selectedPlan === plan.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className={`text-lg font-bold ${selectedPlan === plan.id ? 'text-blue-600' : 'text-gray-900'}`}>
                {plan.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatPrice(plan.prices.monthly.amount)}/mo
              </div>
              {plan.popular && (
                <div className="text-[10px] text-green-600 mt-1">Popular</div>
              )}
              {/* ✅ Show free trial badge ONLY if user hasn't used it */}
              {plan.id === 'basic' && !hasUsedFreeTrial && (
                <div className="text-[10px] text-green-600 mt-1 flex items-center justify-center gap-1">
                  <Gift className="h-2 w-2" />
                  {getText('7 days free', '7 jours gratuits', '7 أيام مجانية')}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* ✅ Free Trial Toggle - ONLY SHOW if user has NOT used free trial */}
      {selectedPlan === 'basic' && !hasUsedFreeTrial && canUseFreeTrial && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{getText('Use 7-Day Free Trial', 'Utiliser l\'essai gratuit de 7 jours', 'استخدم النسخة التجريبية المجانية لمدة 7 أيام')}</p>
                <p className="text-xs text-gray-500">
                  {getText('First 7 days free, then regular price applies', '7 premiers jours gratuits, puis prix normal', 'أول 7 أيام مجانية، ثم السعر العادي')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setUseFreeTrial(!useFreeTrial)}
              className={`relative w-12 h-6 rounded-full transition-colors ${useFreeTrial ? 'bg-green-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${useFreeTrial ? 'right-1' : 'left-1'}`} />
            </button>
          </label>
          
          {useFreeTrial && (
            <div className="mt-3 p-2 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-green-700">
                <AlertCircle className="h-3 w-3" />
                <span>{getText('You will be charged 0 MAD for the first 7 days!', 'Vous serez facturé 0 MAD pour les 7 premiers jours !', 'سيتم محاسبتك 0 درهم لأول 7 أيام!')}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Duration Toggle - Hide when using free trial */}
      {!useFreeTrial && (
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex gap-1">
            {['monthly', 'quarterly', 'yearly'].map((duration) => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedDuration === duration ? 'bg-white text-gray-900 shadow' : 'text-gray-500'
                }`}
              >
                {getText(duration, duration === 'monthly' ? 'Mensuel' : duration === 'quarterly' ? 'Trimestriel' : 'Annuel', 
                  duration === 'monthly' ? 'شهري' : duration === 'quarterly' ? 'ربع سنوي' : 'سنوي')}
                {selectedPlanData?.prices?.[duration]?.savings > 0 && (
                  <span className="ml-1 text-green-600 text-[10px]">-{selectedPlanData.prices[duration].savings}%</span>
                )}
                {duration === 'yearly' && (
                  <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                    {getText('Best Value', 'Meilleure offre', 'أفضل قيمة')}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Payment Method - Hide when using free trial */}
      {!useFreeTrial && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getText('Payment Method', 'Mode de paiement', 'طريقة الدفع')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { id: 'card', name: getText('Card', 'Carte', 'بطاقة') },
              { id: 'cih', name: 'CIH Bank' },
              { id: 'attijari', name: 'Attijari' },
              { id: 'bmce', name: 'BMCE' },
              { id: 'cash', name: getText('Cash', 'Espèces', 'نقدي') }
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPaymentMethod(method.id)}
                className={`p-2 rounded-lg border-2 text-center transition-all ${
                  selectedPaymentMethod === method.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <div className="text-sm font-medium">{method.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Display */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 text-center">
          <h2 className="text-base font-bold text-white mb-1">
            {useFreeTrial 
              ? getText('7-Day Free Trial', 'Essai gratuit de 7 jours', 'نسخة تجريبية مجانية لمدة 7 أيام')
              : `${selectedPlanData?.name} ${getText('Plan', 'Forfait', 'باقة')}`}
          </h2>
          <div className="flex items-center justify-center gap-1">
            {useFreeTrial ? (
              <span className="text-2xl font-bold text-white">0 MAD</span>
            ) : (
              <span className="text-2xl font-bold text-white">{formatPrice(currentPrice)}</span>
            )}
            {!useFreeTrial && (
              <span className="text-blue-200 text-xs">
                /{selectedDuration === 'monthly' ? getText('month', 'mois', 'شهر') : selectedDuration === 'quarterly' ? getText('quarter', 'trimestre', 'ربع سنة') : getText('year', 'an', 'سنة')}
              </span>
            )}
          </div>
          {useFreeTrial && (
            <p className="text-xs text-blue-200 mt-1">
              {getText('Then 49 MAD/month after trial', 'Puis 49 MAD/mois après l\'essai', 'ثم 49 درهم/شهر بعد التجربة')}
            </p>
          )}
          {savings > 0 && !useFreeTrial && (
            <p className="text-xs text-blue-200 mt-1">{getText('Save', 'Économisez', 'وفر')} {savings}%</p>
          )}
        </div>

        {/* Features */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{getText('Features included', 'Fonctionnalités incluses', 'الميزات المضمنة')}:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {selectedPlanData?.features?.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span className="text-xs text-gray-600">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className={`w-full py-2.5 rounded-lg font-semibold text-sm transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 ${
              useFreeTrial
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
            }`}
          >
            {isProcessing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                {useFreeTrial && <Gift className="h-3.5 w-3.5" />}
                {useFreeTrial 
                  ? getText('Start Free Trial', 'Commencer l\'essai gratuit', 'ابدأ النسخة التجريبية المجانية')
                  : getText('Subscribe Now', 'S\'abonner maintenant', 'اشترك الآن')}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default Subscription