import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { 
  Apple, Clock, Target, ChefHat, Calendar, History, CheckCircle, AlertCircle,
  Flame, Utensils, Coffee, Sun, Moon, Trophy, Sparkles, TrendingUp,
  Award, Medal, Star, Heart, Zap, BookOpen, Users, MessageCircle,
  Share2, MoreHorizontal, Image, Video, Play, Grid, List, ThumbsUp,
  Info, Briefcase, GraduationCap, Globe, Linkedin, Instagram, Facebook, Twitter,
  BadgeCheck, Quote, CalendarDays, Activity, Smile, Droplet, Wind,
  ChevronRight, X  
} from 'lucide-react'
import { format, differenceInHours, isAfter } from 'date-fns'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { motion, AnimatePresence } from 'framer-motion'

const DietPlan = () => {
  const { t, i18n } = useTranslation()
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const queryClient = useQueryClient()
  
  const isRTL = i18n.language === 'ar'
  const isFrench = i18n.language === 'fr'

  const getText = (en, fr, ar) => {
    if (isFrench) return fr
    if (isRTL) return ar
    return en
  }
  
  // Fetch ALL diet plans
  const { data: dietPlans, isLoading, error, refetch } = useQuery({
    queryKey: ['allDietPlans'],
    queryFn: async () => {
      const response = await api.get('/users/diet-plans')
      return response.data.data.dietPlans
    },
    retry: false,
  })

  // Mark plan as eaten (completed)
  const { mutate: markAsEaten, isPending: isMarking } = useMutation({
    mutationFn: async (planId) => {
      const response = await api.patch(`/diet-plans/${planId}/complete`)
      return response.data
    },
    onSuccess: () => {
      toast.success(getText('Diet plan marked as eaten! Great job! 🎉', 'Plan alimentaire marqué comme mangé ! Bon travail ! 🎉', 'تم تحديد الخطة الغذائية كمأكولة! عمل رائع! 🎉'))
      queryClient.invalidateQueries(['allDietPlans'])
      queryClient.invalidateQueries(['currentDietPlan'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || getText('Something went wrong', 'Une erreur s\'est produite', 'حدث خطأ ما'))
    }
  })

  // Check if a plan is expired or completed
  const isPlanInactive = (plan) => {
    if (!plan) return true
    if (plan.isCompleted) return true
    if (plan.expiresAt && isAfter(new Date(), new Date(plan.expiresAt))) return true
    return false
  }

  // Get active plans only
  const activePlans = dietPlans?.filter(plan => !isPlanInactive(plan)) || []
  const inactivePlans = dietPlans?.filter(plan => isPlanInactive(plan)) || []

  // Get current active plan
  const currentPlan = activePlans.length > 0 ? activePlans[selectedPlanIndex] : null

  const hoursLeft = currentPlan?.expiresAt ? differenceInHours(new Date(currentPlan.expiresAt), new Date()) : null
  const isExpiringSoon = hoursLeft !== null && hoursLeft <= 24 && hoursLeft > 0

  const handleMarkAsEaten = () => {
    if (currentPlan) {
      markAsEaten(currentPlan._id)
    }
  }

  // Calculate nutrition summary
  const totalCalories = currentPlan?.meals?.reduce((sum, meal) => sum + (meal.calories || 0), 0) || 0
  const totalProtein = currentPlan?.meals?.reduce((sum, meal) => sum + (meal.protein || 0), 0) || 0
  const totalCarbs = currentPlan?.meals?.reduce((sum, meal) => sum + (meal.carbs || 0), 0) || 0
  const totalFat = currentPlan?.meals?.reduce((sum, meal) => sum + (meal.fat || 0), 0) || 0

  // Calculate completion percentage
  const completionPercentage = currentPlan?.targetCalories 
    ? Math.min(100, Math.round((totalCalories / currentPlan.targetCalories) * 100))
    : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
          <AlertCircle className="h-16 w-16 mx-auto text-red-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{getText('Something went wrong', 'Une erreur s\'est produite', 'حدث خطأ ما')}</h3>
          <p className="text-gray-500">{error.message || getText('Please try again', 'Veuillez réessayer', 'الرجاء المحاولة مرة أخرى')}</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
          >
            {getText('Retry', 'Réessayer', 'إعادة المحاولة')}
          </button>
        </div>
      </div>
    )
  }

  if (activePlans.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
              <Apple className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600 uppercase tracking-wide">{getText('Nutrition', 'Nutrition', 'تغذية')}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{getText('Diet Plan', 'Plan alimentaire', 'الخطة الغذائية')}</h1>
          <p className="text-gray-500 mt-1">{getText('Your personalized nutrition guide', 'Votre guide nutritionnel personnalisé', 'دليلك الغذائي المخصص')}</p>
        </div>

        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Apple className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{getText('No Diet Plan Assigned', 'Aucun plan assigné', 'لا توجد خطة غذائية')}</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {getText('Your coach will create a personalized diet plan for you soon', 'Votre coach créera bientôt un plan personnalisé pour vous', 'سيقوم مدربك بإنشاء خطة غذائية مخصصة لك قريباً')}
          </p>
          {inactivePlans.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 justify-center mb-2">
                <History className="h-5 w-5 text-gray-500" />
                <p className="text-sm text-gray-600">
                  {getText('You have', 'Vous avez', 'لديك')} {inactivePlans.length} {getText('completed plans', 'plans terminés', 'خطط مكتملة')}
                </p>
              </div>
              <button
                onClick={() => setShowHistory(true)}
                className="text-blue-600 text-sm hover:underline flex items-center gap-1 mx-auto"
              >
                {getText('View History', 'Voir l\'historique', 'عرض السجل')}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-900">{getText('Plan History', 'Historique des plans', 'سجل الخطط')}</h2>
                <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {inactivePlans.map((plan) => (
                  <div key={plan._id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                      {plan.isCompleted ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {getText('Completed', 'Terminé', 'مكتمل')}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getText('Expired', 'Expiré', 'منتهي')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {getText('Created', 'Créé', 'تم الإنشاء')}: {format(new Date(plan.createdAt), 'MMMM dd, yyyy')}
                    </p>
                    {plan.completedAt && (
                      <p className="text-sm text-gray-500">
                        {getText('Completed', 'Terminé', 'مكتمل')}: {format(new Date(plan.completedAt), 'MMMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
              <Apple className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600 uppercase tracking-wide">{getText('Nutrition Plan', 'Plan Nutritionnel', 'الخطة الغذائية')}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{getText('Diet Plan', 'Plan alimentaire', 'الخطة الغذائية')}</h1>
          <p className="text-gray-500 mt-1">{getText('Your personalized nutrition guide', 'Votre guide nutritionnel personnalisé', 'دليلك الغذائي المخصص')}</p>
        </div>

        {/* Expiration Warning Banner */}
        {!currentPlan?.isCompleted && isExpiringSoon && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-orange-800">{getText('Plan Expiring Soon!', 'Plan bientôt expiré !', 'الخطة تنتهي قريباً!')}</h4>
                <p className="text-sm text-orange-700">
                  {getText('This diet plan expires in', 'Ce plan alimentaire expire dans', 'تنتهي هذه الخطة الغذائية خلال')} {hoursLeft} {getText('hours', 'heures', 'ساعات')}.
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {getText('Expires on', 'Expire le', 'تنتهي في')}: {format(new Date(currentPlan.expiresAt), 'MMMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Plan History Selector */}
        {dietPlans.length > 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <History className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">{getText('Plan History', 'Historique des plans', 'سجل الخطط')}</h3>
              {inactivePlans.length > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {inactivePlans.length} {getText('completed', 'terminés', 'مكتملة')}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {dietPlans.map((plan, index) => {
                const isInactive = isPlanInactive(plan)
                const isCurrent = plan._id === currentPlan?._id
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isInactive) {
                        const planIndex = activePlans.findIndex(p => p._id === plan._id)
                        if (planIndex !== -1) {
                          setSelectedPlanIndex(planIndex)
                        }
                      } else {
                        setSelectedPlanIndex(index)
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                        : isInactive
                        ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {plan.title}
                    {plan.isCompleted && (
                      <span className="ml-2 text-xs">✓</span>
                    )}
                    {!plan.isCompleted && plan.expiresAt && isAfter(new Date(), new Date(plan.expiresAt)) && (
                      <span className="ml-2 text-xs">✗</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Main Diet Plan Card */}
        {currentPlan && !currentPlan.isCompleted && !isPlanInactive(currentPlan) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* Plan Header with Gradient */}
            <div className="relative h-32 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{currentPlan.title}</h2>
                    {currentPlan.description && (
                      <p className="text-green-100 mt-1">{currentPlan.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-100">{getText('Created by your coach', 'Créé par votre coach', 'تم إنشاؤها بواسطة مدربك')}</div>
                    {currentPlan.startDate && (
                      <div className="text-xs text-green-200">
                        {getText('Started', 'Commencé', 'بدأت')}: {new Date(currentPlan.startDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{getText('Daily Progress', 'Progression quotidienne', 'التقدم اليومي')}</span>
                  <span className="text-sm font-semibold text-green-600">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* MARK AS EATEN BUTTON */}
              <div className="mb-6 flex justify-end">
                <button
                  onClick={handleMarkAsEaten}
                  disabled={isMarking}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isMarking ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      {getText('I Ate This Plan ✓', 'J\'ai mangé ce plan ✓', 'لقد تناولت هذه الخطة ✓')}
                    </>
                  )}
                </button>
              </div>

              {/* Nutrition Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center">
                  <Flame className="h-6 w-6 text-red-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">{getText('Calories', 'Calories', 'سعرات')}</p>
                  <p className="text-xl font-bold text-gray-900">{totalCalories} / {currentPlan.targetCalories || '—'}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                  <Droplet className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">{getText('Protein', 'Protéines', 'بروتين')}</p>
                  <p className="text-xl font-bold text-gray-900">{totalProtein}g</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center">
                  <Wind className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">{getText('Carbs', 'Glucides', 'كربوهيدرات')}</p>
                  <p className="text-xl font-bold text-gray-900">{totalCarbs}g</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                  <Activity className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">{getText('Fat', 'Lipides', 'دهون')}</p>
                  <p className="text-xl font-bold text-gray-900">{totalFat}g</p>
                </div>
              </div>

              {/* Macro Split (if available) */}
              {currentPlan.macroSplit && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    {getText('Macro Split', 'Répartition des macros', 'تقسيم الماكرو')}
                  </h3>
                  <div className="flex gap-2 h-2 mb-3">
                    <div className="bg-blue-500 rounded-full" style={{ width: `${currentPlan.macroSplit.protein}%` }} />
                    <div className="bg-yellow-500 rounded-full" style={{ width: `${currentPlan.macroSplit.carbs}%` }} />
                    <div className="bg-purple-500 rounded-full" style={{ width: `${currentPlan.macroSplit.fat}%` }} />
                  </div>
                  <div className="flex justify-around text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>{getText('Protein', 'Protéines', 'بروتين')}: {currentPlan.macroSplit.protein}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>{getText('Carbs', 'Glucides', 'كربوهيدرات')}: {currentPlan.macroSplit.carbs}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span>{getText('Fat', 'Lipides', 'دهون')}: {currentPlan.macroSplit.fat}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Meals */}
              {currentPlan.meals && currentPlan.meals.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-orange-600" />
                    {getText('Daily Meals', 'Repas quotidiens', 'الوجبات اليومية')}
                  </h3>
                  <div className="space-y-4">
                    {currentPlan.meals.map((meal, index) => {
                      const mealIcons = {
                        breakfast: <Coffee className="h-5 w-5" />,
                        lunch: <Sun className="h-5 w-5" />,
                        dinner: <Moon className="h-5 w-5" />,
                        snack: <Apple className="h-5 w-5" />
                      }
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                {mealIcons[meal.type] || <ChefHat className="h-5 w-5 text-orange-600" />}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{meal.name}</h4>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {meal.time}
                                </div>
                              </div>
                            </div>
                            {meal.calories && (
                              <div className="text-right">
                                <span className="text-sm font-medium text-gray-900">{meal.calories} cal</span>
                              </div>
                            )}
                          </div>

                          {meal.description && (
                            <p className="text-gray-600 mb-3 text-sm">{meal.description}</p>
                          )}

                          {/* Meal Macros */}
                          {(meal.protein || meal.carbs || meal.fat) && (
                            <div className="flex gap-3 mb-3">
                              {meal.protein && (
                                <div className="px-2 py-1 bg-blue-50 rounded-lg">
                                  <span className="text-xs text-blue-600">P: {meal.protein}g</span>
                                </div>
                              )}
                              {meal.carbs && (
                                <div className="px-2 py-1 bg-yellow-50 rounded-lg">
                                  <span className="text-xs text-yellow-600">C: {meal.carbs}g</span>
                                </div>
                              )}
                              {meal.fat && (
                                <div className="px-2 py-1 bg-purple-50 rounded-lg">
                                  <span className="text-xs text-purple-600">F: {meal.fat}g</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Foods */}
                          {meal.foods && meal.foods.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">{getText('Foods', 'Aliments', 'الأطعمة')}:</h5>
                              <div className="space-y-1">
                                {meal.foods.map((food, foodIndex) => (
                                  <div key={foodIndex} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                      • {food.name} {food.quantity && `(${food.quantity})`}
                                    </span>
                                    {food.calories && (
                                      <span className="text-gray-400 text-xs">{food.calories} cal</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Coach Notes */}
              {currentPlan.notes && (
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{getText('Coach Notes', 'Notes du coach', 'ملاحظات المدرب')}</h3>
                      <p className="text-gray-700 text-sm">{currentPlan.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Completed Plan View */}
        {currentPlan?.isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{getText('Plan Completed! 🎉', 'Plan terminé ! 🎉', 'اكتملت الخطة! 🎉')}</h2>
            <p className="text-gray-600 mb-4">
              {getText("You've successfully completed the", "Vous avez terminé le", "لقد أكملت بنجاح خطة")} "{currentPlan.title}".
            </p>
            <p className="text-sm text-gray-500">
              {getText('Completed on', 'Terminé le', 'اكتملت في')}: {currentPlan.completedAt ? format(new Date(currentPlan.completedAt), 'MMMM dd, yyyy HH:mm') : getText('Just now', 'À l\'instant', 'الآن')}
            </p>
          </motion.div>
        )}

        {/* Plan Info Footer */}
        {activePlans.length > 1 && (
          <div className="text-center text-sm text-gray-500">
            {getText('Showing plan', 'Affichage du plan', 'عرض الخطة')} {selectedPlanIndex + 1} {getText('of', 'sur', 'من')} {activePlans.length} {getText('active plans', 'plans actifs', 'خطط نشطة')}
            {inactivePlans.length > 0 && (
              <span className="ml-2 text-gray-400">
                • {inactivePlans.length} {getText('completed', 'terminés', 'مكتملة')}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DietPlan