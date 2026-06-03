import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Dumbbell, Mail, Lock, User, ArrowRight, CheckCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  })
  const { register: registerUser } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password', '')

  useEffect(() => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }
    setPasswordChecks(checks)
    
    const strength = Object.values(checks).filter(Boolean).length
    setPasswordStrength(strength)
  }, [password])

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength === 3) return 'Good'
    return 'Strong'
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength <= 2) return 'bg-red-500'
    if (passwordStrength === 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setError(null)
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
      })
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image with Text */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Fitness training"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-blue-800/80"></div>

        {/* Content */}
        <div className="relative z-10 max-w-md mx-auto text-center px-8">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-6">
            <Sparkles className="h-8 w-8 text-yellow-400" />
          </div>
          
          {/* Main Message */}
          <h3 className="text-2xl font-bold text-white mb-4">
            If you want to achieve a great physique
          </h3>
          <p className="text-lg text-blue-200 mb-2">
            Join us and transform your life with FitnessPro
          </p>
          <div className="w-20 h-0.5 bg-gradient-to-r from-blue-400 to-blue-200 mx-auto mt-6"></div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-900 to-transparent"></div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white overflow-y-auto py-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center shadow-lg">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FitnessPro</span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
            <p className="mt-1 text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Full Name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 2 ? 'text-red-500' : passwordStrength === 3 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      {passwordChecks.length ? <CheckCircle className="h-3 w-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                      <span className="text-gray-500">8+ chars</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordChecks.uppercase ? <CheckCircle className="h-3 w-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                      <span className="text-gray-500">Uppercase</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordChecks.number ? <CheckCircle className="h-3 w-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                      <span className="text-gray-500">Number</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordChecks.special ? <CheckCircle className="h-3 w-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                      <span className="text-gray-500">Special</span>
                    </div>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="block w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-0.5 w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                required
              />
              <label htmlFor="terms" className="text-xs text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">Terms</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm mt-4"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-3 w-3" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register