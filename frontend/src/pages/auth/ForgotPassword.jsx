import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, CheckCircle, Dumbbell, Sparkles, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const isRTL = i18n.language === 'ar';
  const isFrench = i18n.language === 'fr';

  const getText = (en, fr, ar) => {
    if (isFrench) return fr;
    if (isRTL) return ar;
    return en;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      // Always show the same message regardless of response
      await api.post('/auth/forgot-password', { email: data.email });
      // Always show the generic success message (even if email doesn't exist)
      setSubmitted(true);
    } catch (err) {
      // Even on error, show the generic message (for security)
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{getText('Check Your Email', 'Vérifiez votre email', 'تحقق من بريدك الإلكتروني')}</h2>
            <p className="text-gray-600 mb-4">
              {getText(
                'If your email is registered and verified, you will receive a password reset link.',
                'Si votre email est enregistré et vérifié, vous recevrez un lien de réinitialisation.',
                'إذا كان بريدك الإلكتروني مسجلاً وتم التحقق منه، فستتلقى رابط إعادة تعيين كلمة المرور.'
              )}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {getText(
                'Please check your inbox and spam folder. The link expires in 1 hour.',
                'Veuillez vérifier votre boîte de réception et vos spams. Le lien expire dans 1 heure.',
                'يرجى التحقق من صندوق الوارد والبريد العشوائي. ينتهي صلاحية الرابط بعد ساعة واحدة.'
              )}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition"
            >
              {getText('Back to Login', 'Retour à la connexion', 'العودة إلى تسجيل الدخول')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        
        <div className="p-8">
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

          {/* Error Alert - Only for validation errors, not for email not found */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{getText('Forgot Password?', 'Mot de passe oublié ?', 'نسيت كلمة المرور؟')}</h2>
            <p className="mt-2 text-sm text-gray-500">
              {getText(
                'Enter your email address and we\'ll send you a link to reset your password.',
                'Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.',
                'أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.'
              )}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Email Address', 'Adresse email', 'البريد الإلكتروني')}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                getText('Send Reset Link', 'Envoyer le lien de réinitialisation', 'إرسال رابط إعادة التعيين')
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              {getText('Back to Login', 'Retour à la connexion', 'العودة إلى تسجيل الدخول')}
            </Link>
          </div>
        </div>

        {/* Decorative Bottom */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-3 w-3 text-blue-400" />
            <span className="text-[10px] text-gray-500">{getText('Secure password reset', 'Réinitialisation sécurisée', 'إعادة تعيين آمنة')}</span>
            <Sparkles className="h-3 w-3 text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;