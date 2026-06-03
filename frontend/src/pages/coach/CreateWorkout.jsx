import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const CreateWorkout = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'strength',
    duration: '',
    difficulty: 'beginner',
    exercises: [],
    scheduledDate: '',
    notes: ''
  })
  
  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    sets: '',
    reps: '',
    weight: '',
    restTime: '',
    notes: ''
  })
  
  const [showExerciseModal, setShowExerciseModal] = useState(false)
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(null)
  
  // Create workout mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await api.post(`/coaches/users/${userId}/workouts`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Workout created successfully!')
      queryClient.invalidateQueries(['userDetails', userId])
      navigate(`/users/${userId}`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create workout')
    }
  })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title) {
      toast.error('Please enter a title')
      return
    }
    if (!formData.scheduledDate) {
      toast.error('Please select a date')
      return
    }
    if (formData.exercises.length === 0) {
      toast.error('Please add at least one exercise')
      return
    }
    mutate(formData)
  }
  
  const addExercise = () => {
    if (currentExercise.name && currentExercise.sets && currentExercise.reps) {
      setFormData({
        ...formData,
        exercises: [...formData.exercises, { 
          ...currentExercise, 
          sets: Number(currentExercise.sets),
          reps: currentExercise.reps
        }]
      })
      setCurrentExercise({ name: '', sets: '', reps: '', weight: '', restTime: '', notes: '' })
      setShowExerciseModal(false)
    } else {
      toast.error('Please enter exercise name, sets, and reps')
    }
  }
  
  const editExercise = (index) => {
    setSelectedExerciseIndex(index)
    setCurrentExercise(formData.exercises[index])
    setShowExerciseModal(true)
  }
  
  const updateExercise = () => {
    if (selectedExerciseIndex !== null) {
      const updatedExercises = [...formData.exercises]
      updatedExercises[selectedExerciseIndex] = { ...currentExercise, sets: Number(currentExercise.sets) }
      setFormData({ ...formData, exercises: updatedExercises })
      setCurrentExercise({ name: '', sets: '', reps: '', weight: '', restTime: '', notes: '' })
      setSelectedExerciseIndex(null)
      setShowExerciseModal(false)
    }
  }
  
  const removeExercise = (index) => {
    const updatedExercises = formData.exercises.filter((_, i) => i !== index)
    setFormData({ ...formData, exercises: updatedExercises })
  }
  
  const workoutTypes = [
    { value: 'strength', label: 'Strength' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'hiit', label: 'HIIT' },
    { value: 'recovery', label: 'Recovery' },
    { value: 'custom', label: 'Custom' }
  ]
  
  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/users/${userId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Workout</h1>
          <p className="text-gray-600 mt-2">Create a personalized workout plan for your client</p>
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workout Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Full Body Strength, Cardio Blast"
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
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Describe the workout goals..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workout Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {workoutTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 45"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {difficultyLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date *
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Any special instructions for the client..."
            />
          </div>
        </div>
        
        {/* Exercises Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Exercises</h2>
            <button
              type="button"
              onClick={() => {
                setCurrentExercise({ name: '', sets: '', reps: '', weight: '', restTime: '', notes: '' })
                setSelectedExerciseIndex(null)
                setShowExerciseModal(true)
              }}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </button>
          </div>
          
          {formData.exercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No exercises added yet</p>
              <p className="text-sm">Click "Add Exercise" to build the workout plan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.exercises.map((exercise, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                        <span className="text-sm text-gray-500">{exercise.sets} sets × {exercise.reps} reps</span>
                        {exercise.weight && <span className="text-sm text-gray-500">{exercise.weight} kg</span>}
                      </div>
                      {exercise.restTime && (
                        <p className="text-sm text-gray-500 mt-1">Rest: {exercise.restTime}s</p>
                      )}
                      {exercise.notes && (
                        <p className="text-sm text-gray-600 mt-1">{exercise.notes}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => editExercise(index)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
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
            onClick={() => navigate(`/users/${userId}`)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary px-6 py-2"
          >
            {isPending ? <LoadingSpinner size="sm" /> : <><Save className="h-4 w-4 mr-2" /> Create Workout</>}
          </button>
        </div>
      </form>
      
      {/* Exercise Modal */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              {selectedExerciseIndex !== null ? 'Edit Exercise' : 'Add Exercise'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  value={currentExercise.name}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Bench Press, Squat"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sets *
                  </label>
                  <input
                    type="number"
                    value={currentExercise.sets}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, sets: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reps *
                  </label>
                  <input
                    type="text"
                    value={currentExercise.reps}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, reps: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., 10-12"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="text"
                    value={currentExercise.weight}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, weight: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., 20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rest Time (seconds)
                  </label>
                  <input
                    type="text"
                    value={currentExercise.restTime}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, restTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., 60"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={currentExercise.notes}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Form tips, modifications, etc."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowExerciseModal(false)
                  setCurrentExercise({ name: '', sets: '', reps: '', weight: '', restTime: '', notes: '' })
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={selectedExerciseIndex !== null ? updateExercise : addExercise}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {selectedExerciseIndex !== null ? 'Update Exercise' : 'Add Exercise'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateWorkout