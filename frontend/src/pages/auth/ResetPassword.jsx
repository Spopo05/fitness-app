import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Dumbbell, Sparkles, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ResetPassword = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const isRTL = i18n.language === 'ar';
  const isFrench = i18n.language === 'fr';

  const getText = (en, fr, ar) => {
    if (isFrench) return fr;
    if (isRTL) return ar;
    return en;
  };

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError(getText('Invalid reset link', 'Lien de réinitialisation invalide', 'رابط إعادة التعيين غير صالح'));
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, getText]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password', '');

  useEffect(() => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordChecks(checks);
    const strength = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return getText('Weak', 'Faible', 'ضعيف');
    if (passwordStrength === 3) return getText('Good', 'Bon', 'جيد');
    return getText('Strong', 'Fort', 'قوي');
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const onSubmit = async (data) => {
    if (!token) {
      setError(getText('Invalid reset link', 'Lien de réinitialisation invalide', 'رابط إعادة التعيين غير صالح'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/reset-password', {
        token: token,
        newPassword: data.password,
      });
      setSubmitted(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || getText('Failed to reset password', 'Échec de la réinitialisation', 'فشل إعادة تعيين كلمة المرور'));
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{getText('Password Reset Successfully!', 'Mot de passe réinitialisé avec succès !', 'تم إعادة تعيين كلمة المرور بنجاح!')}</h2>
            <p className="text-gray-600 mb-6">
              {getText('Your password has been reset. Redirecting you to login...', 'Votre mot de passe a été réinitialisé. Redirection vers la connexion...', 'تم إعادة تعيين كلمة المرور الخاصة بك. جاري إعادة التوجيه إلى تسجيل الدخول...')}
            </p>
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{getText('Invalid Reset Link', 'Lien de réinitialisation invalide', 'رابط إعادة التعيين غير صالح')}</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              to="/forgot-password"
              className="w-full inline-block text-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition"
            >
              {getText('Request New Reset Link', 'Demander un nouveau lien', 'طلب رابط إعادة تعيين جديد')}
            </Link>
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

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{getText('Reset Password', 'Réinitialiser le mot de passe', 'إعادة تعيين كلمة المرور')}</h2>
            <p className="mt-2 text-sm text-gray-500">
              {getText('Enter your new password below.', 'Entrez votre nouveau mot de passe ci-dessous.', 'أدخل كلمة المرور الجديدة أدناه.')}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('New Password', 'Nouveau mot de passe', 'كلمة المرور الجديدة')}
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
                  placeholder={getText('Enter new password', 'Entrez le nouveau mot de passe', 'أدخل كلمة المرور الجديدة')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${getPasswordStrengthColor()} transition-all duration-300 rounded-full`} style={{ width: `${(passwordStrength / 4) * 100}%` }} />
                    </div>
                    <span className={`text-xs font-medium ${passwordStrength <= 2 ? 'text-red-500' : passwordStrength === 3 ? 'text-yellow-600' : 'text-green-600'}`}>
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
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Confirm New Password', 'Confirmer le nouveau mot de passe', 'تأكيد كلمة المرور الجديدة')}
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
                  placeholder={getText('Confirm new password', 'Confirmez le nouveau mot de passe', 'تأكيد كلمة المرور الجديدة')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? <LoadingSpinner size="sm" /> : getText('Reset Password', 'Réinitialiser', 'إعادة تعيين كلمة المرور')}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500 transition-colors inline-flex items-center gap-1">
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

export default ResetPassword;