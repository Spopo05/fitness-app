import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { 
  Eye, EyeOff, Dumbbell, Mail, Lock, User, ArrowRight, 
  CheckCircle, Sparkles, MailCheck, Shield, X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../services/api'

const Register = () => {
  const { t, i18n } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState(null)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const navigate = useNavigate()
  
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  })
  const { register: registerUser } = useAuth()

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
    if (passwordStrength <= 2) return getText('Weak', 'Faible', 'ضعيف')
    if (passwordStrength === 3) return getText('Good', 'Bon', 'جيد')
    return getText('Strong', 'Fort', 'قوي')
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength <= 2) return 'bg-red-500'
    if (passwordStrength === 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const handleResendVerification = async () => {
    setResending(true)
    setResendMessage(null)
    try {
      const response = await api.post('/auth/resend-verification', { email: userEmail })
      setResendMessage({ type: 'success', text: response.data.message })
    } catch (error) {
      setResendMessage({ type: 'error', text: error.response?.data?.message || getText('Failed to resend verification email', 'Échec de l\'envoi de l\'email de vérification', 'فشل في إعادة إرسال بريد التحقق') })
    } finally {
      setResending(false)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/auth/register', {
        email: data.email,
        password: data.password,
        name: data.name,
      })
      
      if (response.data.requiresVerification) {
        setSuccess(true)
        setUserEmail(data.email)
      } else {
        await registerUser({
          email: data.email,
          password: data.password,
          name: data.name,
        })
      }
    } catch (error) {
      setError(error.response?.data?.message || getText('Registration failed. Please try again.', 'Échec de l\'inscription. Veuillez réessayer.', 'فشل التسجيل. يرجى المحاولة مرة أخرى.'))
    } finally {
      setLoading(false)
    }
  }

  // Success page after registration
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MailCheck className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{getText('Verify Your Email', 'Vérifiez votre email', 'تحقق من بريدك الإلكتروني')}</h2>
          <p className="text-gray-600 mb-4">{getText('We\'ve sent a verification link to:', 'Nous avons envoyé un lien de vérification à :', 'لقد أرسلنا رابط التحقق إلى:')}</p>
          <p className="font-semibold text-blue-600 mb-6 break-all">{userEmail}</p>
          <p className="text-sm text-gray-500 mb-6">
            {getText('Please check your inbox and click the verification link to activate your account. The link expires in 24 hours.', 'Veuillez vérifier votre boîte de réception et cliquer sur le lien de vérification pour activer votre compte. Le lien expire dans 24 heures.', 'يرجى التحقق من صندوق الوارد الخاص بك والنقر على رابط التحقق لتنشيط حسابك. ينتهي صلاحية الرابط بعد 24 ساعة.')}
          </p>
          
          {resendMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              resendMessage.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {resendMessage.text}
            </div>
          )}
          
          <button
            onClick={handleResendVerification}
            disabled={resending}
            className="w-full mb-3 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {resending ? <LoadingSpinner size="sm" /> : getText('Resend Verification Email', 'Renvoyer l\'email de vérification', 'إعادة إرسال بريد التحقق')}
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition"
          >
            {getText('Go to Login', 'Aller à la connexion', 'الذهاب إلى تسجيل الدخول')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Decorative Top Bar */}
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
            <h2 className="text-2xl font-bold text-gray-900">{getText('Create account', 'Créer un compte', 'إنشاء حساب')}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {getText('Already have an account?', 'Vous avez déjà un compte ?', 'لديك حساب بالفعل؟')}{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                {getText('Sign in', 'Se connecter', 'تسجيل الدخول')}
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
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Full Name', 'Nom complet', 'الاسم الكامل')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register('name', { required: getText('Name is required', 'Le nom est requis', 'الاسم مطلوب') })}
                  type="text"
                  className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                  placeholder={getText('Full Name', 'Nom complet', 'الاسم الكامل')}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

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
                  {...register('password', {
                    required: getText('Password is required', 'Le mot de passe est requis', 'كلمة المرور مطلوبة'),
                    minLength: { value: 8, message: getText('Password must be at least 8 characters', 'Le mot de passe doit contenir au moins 8 caractères', 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل') },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={getText('Create a strong password', 'Créez un mot de passe fort', 'إنشاء كلمة مرور قوية')}
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
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300 rounded-full`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 2 ? 'text-red-500' : passwordStrength === 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1">
                      {passwordChecks.length ? <CheckCircle className="h-3 w-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                      <span className="text-[11px] text-gray-500">{getText('8+ chars', '8+ caractères', '8+ أحرف')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordChecks.uppercase ? <CheckCircle className="h-3 w-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                      <span className="text-[11px] text-gray-500">{getText('Uppercase', 'Majuscule', 'أحرف كبيرة')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordChecks.number ? <CheckCircle className="h-3 w-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                      <span className="text-[11px] text-gray-500">{getText('Number', 'Nombre', 'رقم')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordChecks.special ? <CheckCircle className="h-3 w-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                      <span className="text-[11px] text-gray-500">{getText('Special', 'Spécial', 'خاص')}</span>
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
                {getText('Confirm Password', 'Confirmer le mot de passe', 'تأكيد كلمة المرور')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: getText('Please confirm your password', 'Veuillez confirmer votre mot de passe', 'يرجى تأكيد كلمة المرور'),
                    validate: (value) => value === password || getText('Passwords do not match', 'Les mots de passe ne correspondent pas', 'كلمات المرور غير متطابقة'),
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="block w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={getText('Confirm your password', 'Confirmez votre mot de passe', 'تأكيد كلمة المرور')}
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
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                required
              />
              <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                {getText('I agree to the', "J'accepte les", 'أوافق على')}{' '}
                <button 
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-blue-600 hover:text-blue-500 hover:underline"
                >
                  {getText('Terms of Service', "Conditions d'utilisation", 'شروط الخدمة')}
                </button>
                {' '}{getText('and', 'et', 'و')}{' '}
                <button 
                  type="button"
                  onClick={() => setShowPrivacy(true)}
                  className="text-blue-600 hover:text-blue-500 hover:underline"
                >
                  {getText('Privacy Policy', 'Politique de confidentialité', 'سياسة الخصوصية')}
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md mt-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  {getText('Create account', 'Créer un compte', 'إنشاء حساب')}
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
                <span className="text-[10px] text-gray-500">{getText('Secure Registration', 'Inscription sécurisée', 'تسجيل آمن')}</span>
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
            
            <span  className="text-[10px] text-gray-500"> © 2026 FitnessPro. {getText('All rights reserved.', 'Tous droits réservés.', 'جميع الحقوق محفوظة.')}</span>
          </div>
        </div>
      </div>

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTerms(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{getText('Terms of Service', "Conditions d'utilisation", 'شروط الخدمة')}</h3>
              <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{getText('1. Acceptance of Terms', '1. Acceptation des conditions', '1. قبول الشروط')}</h4>
                <p>{getText('By accessing and using FitnessPro, you agree to be bound by these Terms of Service.', 'En accédant et en utilisant FitnessPro, vous acceptez d\'être lié par ces conditions d\'utilisation.', 'من خلال الوصول إلى FitnessPro واستخدامه، فإنك توافق على الالتزام بشروط الخدمة هذه.')}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{getText('2. User Accounts', '2. Comptes utilisateur', '2. حسابات المستخدم')}</h4>
                <p>{getText('You are responsible for maintaining the confidentiality of your account credentials.', 'Vous êtes responsable de la confidentialité de vos identifiants de compte.', 'أنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك.')}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{getText('3. Subscription Plans', '3. Formules d\'abonnement', '3. خطط الاشتراك')}</h4>
                <p>{getText('FitnessPro offers various subscription plans. Prices are in Moroccan Dirham (MAD) and are subject to change.', 'FitnessPro propose différentes formules d\'abonnement. Les prix sont en dirhams marocains (MAD) et sont sujets à changement.', 'تقدم FitnessPro خطط اشتراك متنوعة. الأسعار بالدرهم المغربي (MAD) وقابلة للتغيير.')}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{getText('4. Cancellation & Refunds', '4. Annulation et remboursements', '4. الإلغاء واسترداد الأموال')}</h4>
                <p>{getText('You may cancel your subscription at any time through your account settings.', 'Vous pouvez annuler votre abonnement à tout moment via les paramètres de votre compte.', 'يمكنك إلغاء اشتراكك في أي وقت من خلال إعدادات حسابك.')}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{getText('5. Prohibited Activities', '5. Activités interdites', '5. الأنشطة المحظورة')}</h4>
                <p>{getText('You agree not to misuse the platform, attempt unauthorized access, or violate any laws.', 'Vous acceptez de ne pas abuser de la plateforme, de ne pas tenter d\'accès non autorisé ou de violer les lois.', 'أنت توافق على عدم إساءة استخدام المنصة أو محاولة الوصول غير المصرح به أو انتهاك أي قوانين.')}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{getText('6. Limitation of Liability', '6. Limitation de responsabilité', '6. تحديد المسؤولية')}</h4>
                <p>{getText('FitnessPro is not liable for any injuries or damages resulting from use of our services.', 'FitnessPro n\'est pas responsable des blessures ou dommages résultant de l\'utilisation de nos services.', 'FitnessPro ليست مسؤولة عن أي إصابات أو أضرار ناتجة عن استخدام خدماتنا.')}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{getText('7. Changes to Terms', '7. Modifications des conditions', '7. تغييرات الشروط')}</h4>
                <p>{getText('We reserve the right to modify these terms at any time.', 'Nous nous réservons le droit de modifier ces conditions à tout moment.', 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت.')}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{getText('8. Contact Information', '8. Coordonnées', '8. معلومات الاتصال')}</h4>
                <p>{getText('For questions, contact us at legal@fitnesspro.com', 'Pour toute question, contactez-nous à legal@fitnesspro.com', 'للاستفسارات، اتصل بنا على legal@fitnesspro.com')}</p>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button onClick={() => setShowTerms(false)} className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition">
                {getText('I Understand', 'J\'ai compris', 'لقد فهمت')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPrivacy(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{getText('Privacy Policy', 'Politique de confidentialité', 'سياسة الخصوصية')}</h3>
              <button onClick={() => setShowPrivacy(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{getText('Information We Collect', 'Informations que nous collectons', 'المعلومات التي نجمعها')}</h4>
                <p>{getText('We collect personal information including name, email, fitness data, and payment information.', 'Nous collectons des informations personnelles telles que le nom, l\'email, les données de fitness et les informations de paiement.', 'نقوم بجمع معلومات شخصية تشمل الاسم والبريد الإلكتروني وبيانات اللياقة ومعلومات الدفع.')}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{getText('How We Use Your Information', 'Comment nous utilisons vos informations', 'كيف نستخدم معلوماتك')}</h4>
                <p>{getText('We use your data to provide personalized workout plans, track progress, and improve our services.', 'Nous utilisons vos données pour fournir des plans d\'entraînement personnalisés, suivre les progrès et améliorer nos services.', 'نستخدم بياناتك لتقديم خطط تمرين مخصصة وتتبع التقدم وتحسين خدماتنا.')}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{getText('Data Security', 'Sécurité des données', 'أمان البيانات')}</h4>
                <p>{getText('We implement industry-standard security measures to protect your personal information.', 'Nous mettons en œuvre des mesures de sécurité standard de l\'industrie pour protéger vos informations personnelles.', 'نحن ننفذ إجراءات أمنية على مستوى الصناعة لحماية معلوماتك الشخصية.')}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{getText('Third-Party Services', 'Services tiers', 'خدمات الطرف الثالث')}</h4>
                <p>{getText('We may share data with trusted payment processors and analytics providers.', 'Nous pouvons partager des données avec des processeurs de paiement et des fournisseurs d\'analyse de confiance.', 'قد نشارك البيانات مع معالجات الدفع ومزودي التحليلات الموثوقين.')}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{getText('Your Rights', 'Vos droits', 'حقوقك')}</h4>
                <p>{getText('You have the right to access, correct, or delete your personal data.', 'Vous avez le droit d\'accéder, de corriger ou de supprimer vos données personnelles.', 'لديك الحق في الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها.')}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{getText('Cookies', 'Cookies', 'ملفات تعريف الارتباط')}</h4>
                <p>{getText('We use cookies to enhance your experience and analyze usage patterns.', 'Nous utilisons des cookies pour améliorer votre expérience et analyser les modèles d\'utilisation.', 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل أنماط الاستخدام.')}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{getText('Data Retention', 'Conservation des données', 'الاحتفاظ بالبيانات')}</h4>
                <p>{getText('We retain your data as long as your account is active or as needed to provide services.', 'Nous conservons vos données tant que votre compte est actif ou selon les besoins pour fournir des services.', 'نحتفظ ببياناتك طالما أن حسابك نشط أو حسب الحاجة لتقديم الخدمات.')}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{getText('Contact Us', 'Contactez-nous', 'اتصل بنا')}</h4>
                <p>{getText('For privacy concerns, email us at privacy@fitnesspro.com', 'Pour toute question relative à la confidentialité, envoyez-nous un email à privacy@fitnesspro.com', 'للاستفسارات المتعلقة بالخصوصية، راسلنا على privacy@fitnesspro.com')}</p>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button onClick={() => setShowPrivacy(false)} className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition">
                {getText('I Understand', 'J\'ai compris', 'لقد فهمت')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Register