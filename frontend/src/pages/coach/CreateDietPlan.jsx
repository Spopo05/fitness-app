import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, Save, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const CreateDietPlan = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetCalories: '',
    meals: [],
    expiresInHours: '24'
  })
  
  const [currentMeal, setCurrentMeal] = useState({
    name: '',
    time: '',
    description: '',
    calories: '',
    foods: []
  })
  
  const [currentFood, setCurrentFood] = useState({
    name: '',
    quantity: '',
    calories: ''
  })
  
  const [showMealModal, setShowMealModal] = useState(false)
  const [showFoodModal, setShowFoodModal] = useState(false)
  const [selectedMealIndex, setSelectedMealIndex] = useState(null)
  
  // Create diet plan mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await api.post(`/coaches/users/${userId}/diet-plan`, {
        ...data,
        expiresInHours: parseInt(data.expiresInHours)
      })
      return response.data
    },
    onSuccess: (data) => {
      toast.success(`Diet plan created successfully! It will expire in ${data.expiresIn}`)
      queryClient.invalidateQueries(['userDetails', userId])
      navigate(`/clients/${userId}`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create diet plan')
    }
  })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title) {
      toast.error('Please enter a title')
      return
    }
    if (formData.meals.length === 0) {
      toast.error('Please add at least one meal')
      return
    }
    mutate(formData)
  }
  
  // Meal functions
  const addMeal = () => {
    if (currentMeal.name && currentMeal.time) {
      setFormData({
        ...formData,
        meals: [...formData.meals, { ...currentMeal, calories: Number(currentMeal.calories) || 0, foods: currentMeal.foods }]
      })
      setCurrentMeal({ name: '', time: '', description: '', calories: '', foods: [] })
      setShowMealModal(false)
    } else {
      toast.error('Please enter meal name and time')
    }
  }
  
  const editMeal = (index) => {
    setSelectedMealIndex(index)
    setCurrentMeal(formData.meals[index])
    setShowMealModal(true)
  }
  
  const updateMeal = () => {
    if (selectedMealIndex !== null) {
      const updatedMeals = [...formData.meals]
      updatedMeals[selectedMealIndex] = { ...currentMeal, calories: Number(currentMeal.calories) || 0 }
      setFormData({ ...formData, meals: updatedMeals })
      setCurrentMeal({ name: '', time: '', description: '', calories: '', foods: [] })
      setSelectedMealIndex(null)
      setShowMealModal(false)
    }
  }
  
  const removeMeal = (index) => {
    const updatedMeals = formData.meals.filter((_, i) => i !== index)
    setFormData({ ...formData, meals: updatedMeals })
  }
  
  // Food functions
  const addFoodToMeal = () => {
    if (currentFood.name) {
      setCurrentMeal({
        ...currentMeal,
        foods: [...currentMeal.foods, { ...currentFood, calories: Number(currentFood.calories) || 0 }]
      })
      setCurrentFood({ name: '', quantity: '', calories: '' })
      setShowFoodModal(false)
    } else {
      toast.error('Please enter food name')
    }
  }
  
  const removeFoodFromMeal = (index) => {
    const updatedFoods = currentMeal.foods.filter((_, i) => i !== index)
    setCurrentMeal({ ...currentMeal, foods: updatedFoods })
  }
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/clients/${userId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Diet Plan</h1>
          <p className="text-gray-600 mt-2">Create a personalized nutrition plan for your client</p>
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Weight Loss Plan, Muscle Building Plan"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the goals and approach of this diet plan..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Calories (per day)
            </label>
            <input
              type="number"
              value={formData.targetCalories}
              onChange={(e) => setFormData({ ...formData, targetCalories: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2000"
            />
          </div>

          {/* Expiration Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="h-4 w-4 inline mr-1" />
              Plan Duration
            </label>
            <select
              value={formData.expiresInHours}
              onChange={(e) => setFormData({ ...formData, expiresInHours: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="12">12 hours</option>
              <option value="24">24 hours (1 day)</option>
              <option value="48">48 hours (2 days)</option>
              <option value="72">72 hours (3 days)</option>
              <option value="168">168 hours (7 days)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              The diet plan will expire after this time and won't be visible to the user
            </p>
          </div>
        </div>
        
        {/* Meals Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Meals</h2>
            <button
              type="button"
              onClick={() => {
                setCurrentMeal({ name: '', time: '', description: '', calories: '', foods: [] })
                setSelectedMealIndex(null)
                setShowMealModal(true)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Add Meal
            </button>
          </div>
          
          {formData.meals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No meals added yet</p>
              <p className="text-sm">Click "Add Meal" to start building the diet plan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.meals.map((meal, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <h3 className="font-semibold text-gray-900">{meal.name}</h3>
                        <span className="text-sm text-gray-500">{meal.time}</span>
                        {meal.calories > 0 && (
                          <span className="text-sm text-green-600">{meal.calories} cal</span>
                        )}
                      </div>
                      {meal.description && (
                        <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
                      )}
                      
                      {/* Foods */}
                      {meal.foods.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-500 mb-1">FOODS:</p>
                          <div className="space-y-1">
                            {meal.foods.map((food, fIndex) => (
                              <div key={fIndex} className="text-sm text-gray-600">
                                • {food.name} {food.quantity && `(${food.quantity})`}
                                {food.calories > 0 && ` - ${food.calories} cal`}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => editMeal(index)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMeal(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/clients/${userId}`)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isPending ? <LoadingSpinner size="sm" /> : <><Save className="h-4 w-4 inline mr-2" /> Create Diet Plan</>}
          </button>
        </div>
      </form>
      
      {/* Meal Modal */}
      {showMealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {selectedMealIndex !== null ? 'Edit Meal' : 'Add Meal'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meal Name *
                  </label>
                  <input
                    type="text"
                    value={currentMeal.name}
                    onChange={(e) => setCurrentMeal({ ...currentMeal, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Breakfast, Lunch"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={currentMeal.time}
                    onChange={(e) => setCurrentMeal({ ...currentMeal, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={currentMeal.description}
                  onChange={(e) => setCurrentMeal({ ...currentMeal, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calories (optional)
                </label>
                <input
                  type="number"
                  value={currentMeal.calories}
                  onChange={(e) => setCurrentMeal({ ...currentMeal, calories: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 500"
                />
              </div>
              
              {/* Foods */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Foods</label>
                  <button
                    type="button"
                    onClick={() => setShowFoodModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Food
                  </button>
                </div>
                
                {currentMeal.foods.length === 0 ? (
                  <p className="text-sm text-gray-500">No foods added</p>
                ) : (
                  <div className="space-y-2">
                    {currentMeal.foods.map((food, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <div>
                          <span className="font-medium">{food.name}</span>
                          {food.quantity && <span className="text-sm text-gray-500 ml-2">({food.quantity})</span>}
                          {food.calories > 0 && <span className="text-sm text-gray-500 ml-2">{food.calories} cal</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFoodFromMeal(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowMealModal(false)
                  setCurrentMeal({ name: '', time: '', description: '', calories: '', foods: [] })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={selectedMealIndex !== null ? updateMeal : addMeal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {selectedMealIndex !== null ? 'Update Meal' : 'Add Meal'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Food Modal */}
      {showFoodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Add Food</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Name *
                </label>
                <input
                  type="text"
                  value={currentFood.name}
                  onChange={(e) => setCurrentFood({ ...currentFood, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Oatmeal, Chicken Breast"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (optional)
                </label>
                <input
                  type="text"
                  value={currentFood.quantity}
                  onChange={(e) => setCurrentFood({ ...currentFood, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1 cup, 200g"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calories (optional)
                </label>
                <input
                  type="number"
                  value={currentFood.calories}
                  onChange={(e) => setCurrentFood({ ...currentFood, calories: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 300"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowFoodModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addFoodToMeal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Food
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateDietPlan