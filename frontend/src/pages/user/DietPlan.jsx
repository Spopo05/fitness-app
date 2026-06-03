import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Apple, Clock, Target, ChefHat, Calendar, History, CheckCircle, AlertCircle } from 'lucide-react'
import { format, differenceInHours, isAfter } from 'date-fns'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const DietPlan = () => {
  const { t } = useTranslation()
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0)
  const queryClient = useQueryClient()
  
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
      toast.success(t('dietPlan.markedAsEaten'))
      queryClient.invalidateQueries(['allDietPlans'])
      queryClient.invalidateQueries(['currentDietPlan'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('errors.somethingWentWrong'))
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('dietPlan.title')}</h1>
          <p className="text-gray-600 mt-2">{t('dietPlan.subtitle')}</p>
        </div>
        <div className="text-center py-16">
          <AlertCircle className="h-16 w-16 mx-auto text-red-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('errors.somethingWentWrong')}</h3>
          <p className="text-gray-500">{error.message || t('errors.tryAgain')}</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    )
  }

  if (activePlans.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('dietPlan.title')}</h1>
          <p className="text-gray-600 mt-2">{t('dietPlan.subtitle')}</p>
        </div>

        <div className="text-center py-16">
          <Apple className="h-16 w-16 mx-auto text-gray-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('dietPlan.noPlan')}</h3>
          <p className="text-gray-500 mb-6">
            {t('dietPlan.coachWillCreate')}
          </p>
          {inactivePlans.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-gray-600">
                📋 {t('dietPlan.completedPlans')} {inactivePlans.length} {t('dietPlan.plans')}.
              </p>
              <button
                onClick={() => {
                  const firstInactiveIndex = dietPlans.findIndex(p => p._id === inactivePlans[0]._id)
                  setSelectedPlanIndex(firstInactiveIndex)
                }}
                className="mt-2 text-blue-600 text-sm hover:underline"
              >
                {t('dietPlan.viewHistory')} →
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('dietPlan.title')}</h1>
        <p className="text-gray-600 mt-2">{t('dietPlan.subtitle')}</p>
      </div>

      {/* Expiration Warning Banner */}
      {!currentPlan?.isCompleted && isExpiringSoon && (
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-orange-800">{t('dietPlan.expiringSoon')}</h4>
              <p className="text-sm text-orange-700">
                {t('dietPlan.expiresIn')} {hoursLeft} {t('dietPlan.hours')}.
              </p>
              <p className="text-xs text-orange-600 mt-1">
                {t('dietPlan.expiresOn')} {format(new Date(currentPlan.expiresAt), 'MMMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plan History Selector */}
      {dietPlans.length > 1 && (
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <History className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">{t('dietPlan.planHistory')}</h3>
            {inactivePlans.length > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {inactivePlans.length} {t('dietPlan.completedExpired')}
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
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isInactive
                      ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.title}
                  {plan.isCompleted && (
                    <span className="ml-2 text-xs text-green-600">✓ {t('dietPlan.eaten')}</span>
                  )}
                  {!plan.isCompleted && plan.expiresAt && isAfter(new Date(), new Date(plan.expiresAt)) && (
                    <span className="ml-2 text-xs text-red-500">{t('dietPlan.expired')}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Diet Plan Card */}
      {currentPlan && !currentPlan.isCompleted && !isPlanInactive(currentPlan) && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          {/* Plan Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentPlan.title}</h2>
              {currentPlan.description && (
                <p className="text-gray-600 mt-2">{currentPlan.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">{t('dietPlan.createdByCoach')}</div>
              {currentPlan.startDate && (
                <div className="text-sm text-gray-500">
                  {t('dietPlan.started')}: {new Date(currentPlan.startDate).toLocaleDateString()}
                </div>
              )}
              {currentPlan.expiresAt && (
                <div className={`text-xs mt-1 ${isExpiringSoon ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                  {t('dietPlan.expires')}: {format(new Date(currentPlan.expiresAt), 'MMM dd, HH:mm')}
                </div>
              )}
            </div>
          </div>

          {/* MARK AS EATEN BUTTON */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleMarkAsEaten}
              disabled={isMarking}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isMarking ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  {t('dietPlan.iAteThis')}
                </>
              )}
            </button>
          </div>

          {/* Nutrition Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">{t('dietPlan.targetCalories')}</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {currentPlan.targetCalories || t('dietPlan.notSet')}
              </p>
            </div>

            {currentPlan.macroSplit && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">{t('dietPlan.protein')}</div>
                  <p className="text-xl font-bold text-blue-900 mt-1">
                    {currentPlan.macroSplit.protein}%
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800">{t('dietPlan.carbs')}</div>
                  <p className="text-xl font-bold text-yellow-900 mt-1">
                    {currentPlan.macroSplit.carbs}%
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-purple-800">{t('dietPlan.fat')}</div>
                  <p className="text-xl font-bold text-purple-900 mt-1">
                    {currentPlan.macroSplit.fat}%
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Meals */}
          {currentPlan.meals && currentPlan.meals.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('dietPlan.dailyMeals')}</h3>
              <div className="space-y-4">
                {currentPlan.meals.map((meal, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <ChefHat className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-gray-900">{meal.name}</h4>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {meal.time}
                      </div>
                    </div>

                    {meal.description && (
                      <p className="text-gray-600 mb-3">{meal.description}</p>
                    )}

                    {/* Meal Macros */}
                    {(meal.calories || meal.protein || meal.carbs || meal.fat) && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        {meal.calories && (
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-xs text-gray-500">{t('dietPlan.calories')}</div>
                            <div className="font-semibold">{meal.calories}</div>
                          </div>
                        )}
                        {meal.protein && (
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="text-xs text-blue-600">{t('dietPlan.protein')}</div>
                            <div className="font-semibold text-blue-900">{meal.protein}g</div>
                          </div>
                        )}
                        {meal.carbs && (
                          <div className="text-center p-2 bg-yellow-50 rounded">
                            <div className="text-xs text-yellow-600">{t('dietPlan.carbs')}</div>
                            <div className="font-semibold text-yellow-900">{meal.carbs}g</div>
                          </div>
                        )}
                        {meal.fat && (
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <div className="text-xs text-purple-600">{t('dietPlan.fat')}</div>
                            <div className="font-semibold text-purple-900">{meal.fat}g</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Foods */}
                    {meal.foods && meal.foods.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">{t('dietPlan.foods')}:</h5>
                        <div className="space-y-1">
                          {meal.foods.map((food, foodIndex) => (
                            <div key={foodIndex} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">
                                {food.name} {food.quantity && `(${food.quantity})`}
                              </span>
                              {food.calories && (
                                <span className="text-gray-500">{food.calories} {t('dietPlan.cal')}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {currentPlan.notes && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{t('dietPlan.coachNotes')}</h3>
              <p className="text-blue-800">{currentPlan.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Completed Plan View */}
      {currentPlan?.isCompleted && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('dietPlan.planCompleted')}</h2>
          <p className="text-gray-600 mb-4">
            {t('dietPlan.completedPlanMessage')} "{currentPlan.title}".
          </p>
          <p className="text-sm text-gray-500">
            {t('dietPlan.completedOn')}: {currentPlan.completedAt ? format(new Date(currentPlan.completedAt), 'MMMM dd, yyyy HH:mm') : t('dietPlan.justNow')}
          </p>
        </div>
      )}

      {/* Plan Count Info */}
      {activePlans.length > 1 && (
        <div className="text-center text-sm text-gray-500">
          {t('dietPlan.showingPlan')} {selectedPlanIndex + 1} {t('dietPlan.of')} {activePlans.length} {t('dietPlan.activePlans')}
          {inactivePlans.length > 0 && (
            <span className="ml-2 text-gray-400">
              • {inactivePlans.length} {t('dietPlan.completedExpired')}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default DietPlan