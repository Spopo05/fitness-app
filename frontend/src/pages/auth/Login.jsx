import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { 
  Eye, EyeOff, Dumbbell, Mail, Lock, ArrowRight, 
  Shield, CheckCircle, Sparkles, Crown
} from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../services/api'

const Login = () => {
  const { t, i18n } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const navigate = useNavigate()

  const isRTL = i18n.language === 'ar'
  const isFrench = i18n.language === 'fr'

  const getText = (en, fr, ar) => {
    if (isFrench) return fr
    if (isRTL) return ar
    return en
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
  setLoading(true);
  setError(null);

  try {
    const response = await api.post('/auth/login', {
      email: data.email,
      password: data.password,
    });

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));

    window.location.href = '/dashboard';
  } catch (err) {
    console.log('LOGIN ERROR:', err.response?.data);

    const status = err.response?.status;
    const message = err.response?.data?.message || '';

    // Email not verified
    if (
      status === 403 &&
      message.toLowerCase().includes('verify your email')
    ) {
      setError(message);
      return;
    }

    // Subscription required
    if (
      status === 403 &&
      (
        message.toLowerCase().includes('subscription') ||
        message.toLowerCase().includes('active subscription')
      )
    ) {
      setShowSubscriptionModal(true);
      return;
    }

    // Invalid credentials
    if (status === 401) {
      setError('Invalid email or password');
      return;
    }

    setError(message || 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        
        <div className="p-6 sm:p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FitnessPro
              </span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{getText('Welcome back', 'Bon retour', 'مرحباً بعودتك')}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {getText('Don\'t have an account?', 'Vous n\'avez pas de compte ?', 'ليس لديك حساب؟')}{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                {getText('Sign up', 'S\'inscrire', 'التسجيل')}
              </Link>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Email address', 'Adresse email', 'البريد الإلكتروني')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: getText('Email is required', 'L\'email est requis', 'البريد الإلكتروني مطلوب'),
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: getText('Invalid email address', 'Adresse email invalide', 'عنوان بريد إلكتروني غير صالح'),
                    },
                  })}
                  type="email"
                  className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                {getText('Password', 'Mot de passe', 'كلمة المرور')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register('password', { required: getText('Password is required', 'Le mot de passe est requis', 'كلمة المرور مطلوبة') })}
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={getText('Enter your password', 'Entrez votre mot de passe', 'أدخل كلمة المرور')}
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
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-500">
                {getText('Forgot password?', 'Mot de passe oublié ?', 'نسيت كلمة المرور؟')}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  {getText('Sign in', 'Se connecter', 'تسجيل الدخول')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Trust Badges */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-green-500" />
                <span className="text-[10px] text-gray-500">{getText('Secure Login', 'Connexion sécurisée', 'تسجيل دخول آمن')}</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-[10px] text-gray-500">{getText('Privacy Protected', 'Confidentialité protégée', 'الخصوصية محمية')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Bottom */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-3 w-3 text-blue-400" />
            <span className="text-[10px] text-gray-500">{getText('Transform your fitness journey', 'Transformez votre parcours fitness', 'حول رحلتك اللياقية')}</span>
            <Sparkles className="h-3 w-3 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Subscription Required Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSubscriptionModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-10 w-10 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {getText('Subscription Required', 'Abonnement requis', 'الاشتراك مطلوب')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {getText(
                    'You need an active subscription to access this feature.',
                    'Vous avez besoin d\'un abonnement actif pour accéder à cette fonctionnalité.',
                    'أنت بحاجة إلى اشتراك نشط للوصول إلى هذه الميزة.'
                  )}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSubscriptionModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    {getText('Cancel', 'Annuler', 'إلغاء')}
                  </button>
                  <button
                    onClick={() => navigate('/subscription')}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition"
                  >
                    {getText('View Plans', 'Voir les offres', 'عرض الخطط')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login