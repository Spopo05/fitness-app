import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  Trash2, 
  CreditCard,
  Bell,
  Shield,
  LogOut,
  CheckCircle,
  Eye,
  EyeOff,
  Upload,
  Key,
  AlertCircle,
  Sparkles,
  Crown,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Globe,
  Smartphone,
  Monitor,
  Fingerprint,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  Heart,
  Zap,
  Award,
  Target,
  Flame,
  DollarSign,
  Gift,
  Star,
  BadgeCheck,
  Loader2,
  ChevronRight,
  ArrowRight,
  MessageCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const Settings = () => {
  const { t, i18n } = useTranslation()
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  
  const isRTL = i18n.language === 'ar'
  const isFrench = i18n.language === 'fr'

  const getText = (en, fr, ar) => {
    if (isFrench) return fr
    if (isRTL) return ar
    return en
  }
  
  const [activeTab, setActiveTab] = useState('profile')
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  
  // Password change state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || ''
  })
  const [profileErrors, setProfileErrors] = useState({})
  
  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    messages: true,
    workouts: true,
    diet: true,
    promotions: false,
    achievements: true,
    newsletter: false
  })
  
  // Calculate password strength
  useEffect(() => {
    let strength = 0
    const pwd = passwordData.newPassword
    if (pwd.length >= 8) strength++
    if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength++
    if (pwd.match(/[0-9]/)) strength++
    if (pwd.match(/[^a-zA-Z0-9]/)) strength++
    setPasswordStrength(strength)
  }, [passwordData.newPassword])
  
  // Fetch subscription info
  const { data: subscription } = useQuery({
    queryKey: ['currentSubscription'],
    queryFn: async () => {
      try {
        const response = await api.get('/subscriptions/current')
        return response.data.data.subscription
      } catch {
        return null
      }
    },
    retry: false
  })
  
  // Upload profile picture mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post('/users/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data.data.user
    },
    onSuccess: (userData) => {
      updateUser(userData)
      queryClient.invalidateQueries(['userProfile'])
      toast.success(getText('Profile picture updated successfully!', 'Photo de profil mise à jour !', 'تم تحديث صورة الملف الشخصي بنجاح!'))
      setUploading(false)
      setPreviewImage(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || getText('Failed to upload picture', 'Échec du téléchargement', 'فشل رفع الصورة'))
      setUploading(false)
      setPreviewImage(null)
    }
  })
  
  // Delete profile picture mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/users/profile-picture')
      return response.data.data.user
    },
    onSuccess: (userData) => {
      updateUser(userData)
      queryClient.invalidateQueries(['userProfile'])
      toast.success(getText('Profile picture removed successfully', 'Photo de profil supprimée', 'تم إزالة صورة الملف الشخصي بنجاح'))
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || getText('Failed to delete picture', 'Échec de la suppression', 'فشل حذف الصورة'))
    }
  })
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.patch('/users/profile', data)
      return response.data.data.user
    },
    onSuccess: (userData) => {
      updateUser(userData)
      toast.success(getText('Profile updated successfully', 'Profil mis à jour', 'تم تحديث الملف الشخصي بنجاح'))
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || getText('Failed to update profile', 'Échec de la mise à jour', 'فشل تحديث الملف الشخصي'))
    }
  })
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/users/change-password', data)
      return response.data
    },
    onSuccess: () => {
      toast.success(getText('Password changed successfully!', 'Mot de passe changé !', 'تم تغيير كلمة المرور بنجاح!'))
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setPasswordErrors({})
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || getText('Failed to change password', 'Échec du changement', 'فشل تغيير كلمة المرور'))
    }
  })
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error(getText('Please select a valid image', 'Veuillez sélectionner une image valide', 'الرجاء تحديد صورة صالحة'))
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error(getText('Image size must be less than 5MB', 'L\'image doit faire moins de 5 Mo', 'يجب أن يكون حجم الصورة أقل من 5 ميجابايت'))
      return
    }
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result)
    }
    reader.readAsDataURL(file)
    
    const formData = new FormData()
    formData.append('profilePicture', file)
    setUploading(true)
    uploadPhotoMutation.mutate(formData)
  }
  
  const handleRemovePhoto = () => {
    if (window.confirm(getText('Are you sure you want to remove your profile picture?', 'Voulez-vous vraiment supprimer votre photo de profil ?', 'هل أنت متأكد من إزالة صورة الملف الشخصي؟'))) {
      deletePhotoMutation.mutate()
    }
  }
  
  const handleProfileSubmit = (e) => {
    e.preventDefault()
    const errors = {}
    if (!profileData.name.trim()) errors.name = getText('Name is required', 'Nom requis', 'الاسم مطلوب')
    if (!profileData.email.trim()) errors.email = getText('Email is required', 'Email requis', 'البريد الإلكتروني مطلوب')
    if (profileData.email && !/^\S+@\S+$/i.test(profileData.email)) {
      errors.email = getText('Invalid email address', 'Email invalide', 'بريد إلكتروني غير صالح')
    }
    
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors)
      return
    }
    
    updateProfileMutation.mutate(profileData)
  }
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    const errors = {}
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = getText('Current password is required', 'Mot de passe actuel requis', 'كلمة المرور الحالية مطلوبة')
    }
    if (!passwordData.newPassword) {
      errors.newPassword = getText('New password is required', 'Nouveau mot de passe requis', 'كلمة المرور الجديدة مطلوبة')
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = getText('Password must be at least 6 characters', 'Le mot de passe doit contenir au moins 6 caractères', 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل')
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = getText('Passwords do not match', 'Les mots de passe ne correspondent pas', 'كلمات المرور غير متطابقة')
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
  }
  
  const handleSaveNotifications = () => {
    toast.success(getText('Notification preferences saved!', 'Préférences de notification enregistrées !', 'تم حفظ تفضيلات الإشعارات!'))
  }
  
  const getPasswordStrengthText = () => {
    const strengthTexts = getText('Very Weak,Weak,Medium,Strong,Very Strong', 'Très Faible,Faible,Moyen,Fort,Très Fort', 'ضعيف جداً,ضعيف,متوسط,قوي,قوي جداً').split(',')
    if (passwordStrength === 0) return strengthTexts[0]
    if (passwordStrength === 1) return strengthTexts[1]
    if (passwordStrength === 2) return strengthTexts[2]
    if (passwordStrength === 3) return strengthTexts[3]
    return strengthTexts[4]
  }
  
  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-red-500'
    if (passwordStrength === 1) return 'bg-orange-500'
    if (passwordStrength === 2) return 'bg-yellow-500'
    if (passwordStrength === 3) return 'bg-green-500'
    return 'bg-emerald-500'
  }
  
  const tabs = [
    { id: 'profile', name: getText('Profile', 'Profil', 'الملف الشخصي'), icon: User, description: getText('Manage your personal information', 'Gérez vos informations personnelles', 'إدارة معلوماتك الشخصية'), color: 'blue' },
    { id: 'security', name: getText('Security', 'Sécurité', 'الأمان'), icon: Shield, description: getText('Update your password and security', 'Mettez à jour votre mot de passe et votre sécurité', 'تحديث كلمة المرور والأمان'), color: 'purple' },
    { id: 'notifications', name: getText('Notifications', 'Notifications', 'الإشعارات'), icon: Bell, description: getText('Configure how you receive updates', 'Configurez comment vous recevez les mises à jour', 'تكوين كيفية تلقي التحديثات'), color: 'green' },
    { id: 'subscription', name: getText('Subscription', 'Abonnement', 'الاشتراك'), icon: Crown, description: getText('Manage your plan and billing', 'Gérez votre plan et votre facturation', 'إدارة خطتك والفواتير'), color: 'yellow' },
  ]
  
  const quickActions = [
    { icon: Heart, label: getText('Health Profile', 'Profil Santé', 'الملف الصحي'), description: getText('Update your health metrics', 'Mettez à jour vos mesures de santé', 'تحديث مقاييس صحتك'), color: 'red', onClick: () => navigate('/profile') },
    { icon: Target, label: getText('Fitness Goals', 'Objectifs Fitness', 'أهداف اللياقة'), description: getText('Set and track your goals', 'Définissez et suivez vos objectifs', 'تحديد وتتبع أهدافك'), color: 'blue', onClick: () => navigate('/profile') },
    { icon: Calendar, label: getText('Schedule', 'Programme', 'الجدول'), description: getText('Manage your workout schedule', 'Gérez votre programme d\'entraînement', 'إدارة جدول تمارينك'), color: 'green', onClick: () => navigate('/workouts') },
    { icon: MessageCircle, label: getText('Messages', 'Messages', 'الرسائل'), description: getText('Check your messages', 'Vérifiez vos messages', 'تحقق من رسائلك'), color: 'purple', onClick: () => navigate('/messages') },
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 lg:mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                {getText('Account Settings', 'Paramètres du compte', 'إعدادات الحساب')}
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-1">
                {getText('Settings', 'Paramètres', 'الإعدادات')}
              </h1>
            </div>
          </div>
          <p className="text-gray-500 text-base max-w-2xl">
            {getText('Manage your account settings, security preferences, and subscription details all in one place.', 'Gérez les paramètres de votre compte, vos préférences de sécurité et les détails de votre abonnement en un seul endroit.', 'إدارة إعدادات حسابك وتفضيلات الأمان وتفاصيل الاشتراك في مكان واحد.')}
          </p>
        </motion.div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-80 flex-shrink-0"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-24">
              {/* Profile Summary */}
              <div className="p-6 text-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="relative inline-block group">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 mx-auto shadow-xl ring-4 ring-white">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : user?.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 p-1.5 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all group-hover:scale-110"
                  >
                    <Camera className="h-3.5 w-3.5 text-gray-600" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    className="hidden"
                  />
                </div>
                <h3 className="font-bold text-gray-900 mt-4 text-xl">{user?.name}</h3>
                <p className="text-sm text-gray-500 capitalize flex items-center justify-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {user?.role}
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  {user?.emailVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle className="h-3 w-3" />
                      {getText('Verified', 'Vérifié', 'تم التحقق')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                      <AlertCircle className="h-3 w-3" />
                      {getText('Unverified', 'Non vérifié', 'غير محقق')}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Tabs */}
              <div className="p-3 space-y-1.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  const colorGradients = {
                    blue: 'from-blue-500 to-blue-600',
                    purple: 'from-purple-500 to-purple-600',
                    green: 'from-green-500 to-green-600',
                    yellow: 'from-yellow-500 to-orange-500',
                  }
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? `bg-gradient-to-r ${colorGradients[tab.color]} text-white shadow-md`
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      <div className="flex-1 text-left">
                        <p className={isActive ? 'text-white font-semibold' : 'text-gray-700'}>{tab.name}</p>
                        <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                          {tab.description}
                        </p>
                      </div>
                      {isActive && <Sparkles className="h-3.5 w-3.5 text-white" />}
                    </button>
                  )
                })}
              </div>
              
              {/* Logout Button */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  {getText('Sign Out', 'Déconnexion', 'تسجيل الخروج')}
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <AnimatePresence mode="wait">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{getText('Profile Information', 'Informations du profil', 'معلومات الملف الشخصي')}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{getText('Update your personal details and profile information', 'Mettez à jour vos informations personnelles', 'تحديث تفاصيلك الشخصية ومعلومات الملف الشخصي')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {getText('Full Name', 'Nom complet', 'الاسم الكامل')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder={getText('Your full name', 'Votre nom complet', 'اسمك الكامل')}
                          />
                        </div>
                        {profileErrors.name && <p className="mt-1 text-xs text-red-600">{profileErrors.name}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {getText('Email Address', 'Adresse email', 'البريد الإلكتروني')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="your@email.com"
                          />
                        </div>
                        {profileErrors.email && <p className="mt-1 text-xs text-red-600">{profileErrors.email}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{getText('Phone Number', 'Numéro de téléphone', 'رقم الهاتف')}</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Smartphone className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{getText('Location', 'Emplacement', 'الموقع')}</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Globe className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={profileData.location}
                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder={getText('City, Country', 'Ville, Pays', 'مدينة، بلد')}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{getText('Bio', 'Bio', 'السيرة الذاتية')}</label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder={getText('Tell us a little about yourself...', 'Parlez-nous un peu de vous...', 'أخبرنا قليلاً عن نفسك...')}
                      />
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-50"
                      >
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {getText('Save Changes', 'Enregistrer', 'حفظ التغييرات')}
                      </button>
                    </div>
                  </form>
                  
                  {/* Profile Picture Section */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Camera className="h-5 w-5 text-blue-600" />
                      {getText('Profile Picture', 'Photo de profil', 'صورة الملف الشخصي')}
                    </h3>
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-md ring-4 ring-white">
                        {user?.profilePicture ? (
                          <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          {getText('Upload New', 'Télécharger', 'رفع جديد')}
                        </button>
                        {user?.profilePicture && (
                          <button
                            onClick={handleRemovePhoto}
                            className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            {getText('Remove', 'Supprimer', 'إزالة')}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      {getText('Recommended: Square image, at least 400x400px. Max size 5MB.', 'Recommandé : Image carrée, au moins 400x400px. Taille max 5 Mo.', 'موصى به: صورة مربعة، بحجم 400 × 400 بكسل على الأقل. الحد الأقصى للحجم 5 ميجابايت.')}
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-xl">
                        <Shield className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{getText('Security Settings', 'Paramètres de sécurité', 'إعدادات الأمان')}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{getText('Update your password and enhance account security', 'Mettez à jour votre mot de passe et renforcez la sécurité', 'تحديث كلمة المرور وتعزيز أمان الحساب')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-blue-800">{getText('Password Security Tips', 'Conseils de sécurité', 'نصائح أمان كلمة المرور')}</p>
                          <ul className="text-xs text-blue-700 mt-2 space-y-1">
                            <li className="flex items-center gap-2">• {getText('Use at least 8 characters', 'Utilisez au moins 8 caractères', 'استخدم 8 أحرف على الأقل')}</li>
                            <li className="flex items-center gap-2">• {getText('Include uppercase and lowercase letters', 'Incluez des majuscules et minuscules', 'قم بتضمين الأحرف الكبيرة والصغيرة')}</li>
                            <li className="flex items-center gap-2">• {getText('Add numbers and special characters', 'Ajoutez des chiffres et caractères spéciaux', 'أضف أرقامًا ورموزًا خاصة')}</li>
                            <li className="flex items-center gap-2">• {getText('Avoid using common passwords', 'Évitez les mots de passe courants', 'تجنب استخدام كلمات المرور الشائعة')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{getText('Current Password', 'Mot de passe actuel', 'كلمة المرور الحالية')}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder={getText('Enter current password', 'Entrez le mot de passe actuel', 'أدخل كلمة المرور الحالية')}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && <p className="mt-1 text-xs text-red-600">{passwordErrors.currentPassword}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{getText('New Password', 'Nouveau mot de passe', 'كلمة المرور الجديدة')}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Key className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder={getText('Enter new password', 'Entrez le nouveau mot de passe', 'أدخل كلمة المرور الجديدة')}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                        </button>
                      </div>
                      {passwordData.newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">{getText('Password Strength', 'Force du mot de passe', 'قوة كلمة المرور')}:</span>
                            <span className={`text-xs font-medium ${
                              passwordStrength === 0 ? 'text-red-500' :
                              passwordStrength === 1 ? 'text-orange-500' :
                              passwordStrength === 2 ? 'text-yellow-500' :
                              passwordStrength === 3 ? 'text-green-500' : 'text-emerald-500'
                            }`}>{getPasswordStrengthText()}</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getPasswordStrengthColor()} rounded-full transition-all duration-300`}
                              style={{ width: `${(passwordStrength / 4) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {passwordErrors.newPassword && <p className="mt-1 text-xs text-red-600">{passwordErrors.newPassword}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{getText('Confirm New Password', 'Confirmer le mot de passe', 'تأكيد كلمة المرور الجديدة')}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CheckCircle className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                      {passwordErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{passwordErrors.confirmPassword}</p>}
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md disabled:opacity-50"
                      >
                        {changePasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {getText('Update Password', 'Mettre à jour', 'تحديث كلمة المرور')}
                      </button>
                    </div>
                  </form>
                  
                  {/* Two-Factor Authentication Section */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Fingerprint className="h-5 w-5 text-purple-600" />
                      {getText('Two-Factor Authentication', 'Authentification à deux facteurs', 'المصادقة الثنائية')}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-700">{getText('Add an extra layer of security to your account', 'Ajoutez une couche de sécurité supplémentaire', 'أضف طبقة إضافية من الأمان')}</p>
                        <p className="text-xs text-gray-500 mt-1">{getText('Protect your account with 2FA verification', 'Protégez votre compte avec la vérification 2FA', 'احمِ حسابك بالتحقق الثنائي')}</p>
                      </div>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition">
                        {getText('Enable 2FA', 'Activer 2FA', 'تفعيل التحقق الثنائي')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-xl">
                        <Bell className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{getText('Notification Preferences', 'Préférences de notification', 'تفضيلات الإشعارات')}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{getText('Choose how and when you want to receive updates', 'Choisissez comment et quand recevoir les mises à jour', 'اختر كيف ومتى تريد تلقي التحديثات')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {Object.entries(notifications).map(([key, value]) => {
                      const labels = {
                        email: getText('Email Notifications', 'Notifications email', 'إشعارات البريد الإلكتروني'),
                        push: getText('Push Notifications', 'Notifications push', 'إشعارات الدفع'),
                        messages: getText('Message Alerts', 'Alertes de message', 'تنبيهات الرسائل'),
                        workouts: getText('Workout Reminders', 'Rappels d\'entraînement', 'تذكيرات التمرين'),
                        diet: getText('Diet Plan Updates', 'Mises à jour du plan alimentaire', 'تحديثات الخطة الغذائية'),
                        promotions: getText('Promotions & Offers', 'Promotions et offres', 'العروض الترويجية'),
                        achievements: getText('Achievement Badges', 'Badges de réalisation', 'شارات الإنجاز'),
                        newsletter: getText('Weekly Newsletter', 'Newsletter hebdomadaire', 'النشرة الأسبوعية')
                      }
                      const descriptions = {
                        email: getText('Receive updates about your account', 'Recevez des mises à jour sur votre compte', 'تلقي التحديثات حول حسابك'),
                        push: getText('Get real-time updates on your device', 'Recevez des mises à jour en temps réel', 'تلقي التحديثات في الوقت الفعلي'),
                        messages: getText('Get notified when you receive a new message', 'Soyez averti lorsque vous recevez un nouveau message', 'يتم إعلامك عند استلام رسالة جديدة'),
                        workouts: getText('Get reminders for upcoming workouts', 'Recevez des rappels pour vos entraînements', 'تلقي تذكيرات للتمارين القادمة'),
                        diet: getText('Updates about your diet plans', 'Mises à jour sur vos plans alimentaires', 'تحديثات حول خططك الغذائية'),
                        promotions: getText('Exclusive offers and promotions', 'Offres et promotions exclusives', 'عروض حصرية وترويجية'),
                        achievements: getText('Get notified about your achievements', 'Soyez averti de vos réalisations', 'يتم إعلامك بإنجازاتك'),
                        newsletter: getText('Weekly fitness tips and news', 'Conseils fitness et actualités hebdomadaires', 'نصائح اللياقة والأخبار الأسبوعية')
                      }
                      return (
                        <div key={key} className="flex items-center justify-between p-5 hover:bg-gray-50 transition">
                          <div>
                            <p className="font-medium text-gray-900">{labels[key]}</p>
                            <p className="text-sm text-gray-500">{descriptions[key]}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={value}
                              onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button 
                      onClick={handleSaveNotifications}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
                    >
                      <Save className="h-4 w-4" />
                      {getText('Save Preferences', 'Enregistrer', 'حفظ التفضيلات')}
                    </button>
                  </div>
                </motion.div>
              )}
              
              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <motion.div
                  key="subscription"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-xl">
                        <Crown className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{getText('Subscription & Billing', 'Abonnement et facturation', 'الاشتراك والفواتير')}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{getText('Manage your plan, payments, and subscription details', 'Gérez votre plan, vos paiements et les détails de votre abonnement', 'إدارة خطتك ومدفوعاتك وتفاصيل اشتراكك')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                      {subscription?.plan === 'elite' ? (
                        <Crown className="h-12 w-12 text-yellow-600" />
                      ) : subscription?.plan === 'premium' ? (
                        <Star className="h-12 w-12 text-purple-600" />
                      ) : subscription?.plan === 'pro' ? (
                        <Award className="h-12 w-12 text-blue-600" />
                      ) : (
                        <Gift className="h-12 w-12 text-green-600" />
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {subscription?.plan ? subscription.plan.toUpperCase() : getText('Free Trial', 'Essai gratuit', 'نسخة تجريبية مجانية')}
                    </h3>
                    
                    {subscription?.plan ? (
                      <>
                        <p className="text-gray-600 mb-2">
                          {subscription.price} MAD / {subscription.duration}
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                          {getText('Renews on', 'Renouvelle le', 'يتجدد في')} {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm mb-6">
                          <CheckCircle className="h-4 w-4" />
                          {getText('Active Subscription', 'Abonnement actif', 'اشتراك نشط')}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500 max-w-md mx-auto mb-4">
                          {getText('You\'re currently on a free trial. Upgrade to access premium features including AI workouts, personalized nutrition, and 1-on-1 coaching.', 'Vous êtes actuellement en essai gratuit. Passez à la version premium pour accéder aux fonctionnalités premium, notamment les entraînements IA, la nutrition personnalisée et le coaching individuel.', 'أنت حالياً في الفترة التجريبية المجانية. قم بالترقية للوصول إلى الميزات المميزة بما في ذلك تمارين الذكاء الاصطناعي والتغذية المخصصة والتدريب الفردي.')}
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm mb-6">
                          <Gift className="h-4 w-4" />
                          {getText('7 Days Free Trial Active', 'Essai gratuit de 7 jours actif', '7 أيام نسخة تجريبية مجانية نشطة')}
                        </div>
                      </>
                    )}
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
                        <p className="text-sm font-medium text-gray-900">{getText('AI Workouts', 'Entraînements IA', 'تمارين الذكاء الاصطناعي')}</p>
                        <p className="text-xs text-gray-500">{getText('Personalized AI-generated workouts', 'Entraînements personnalisés générés par IA', 'تمارين مخصصة تم إنشاؤها بواسطة الذكاء الاصطناعي')}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
                        <p className="text-sm font-medium text-gray-900">{getText('Nutrition Plans', 'Plans nutritionnels', 'الخطط الغذائية')}</p>
                        <p className="text-xs text-gray-500">{getText('Custom meal plans & tracking', 'Plas de repas personnalisés et suivi', 'خطط وجبات مخصصة وتتبع')}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
                        <p className="text-sm font-medium text-gray-900">{getText('1-on-1 Coaching', 'Coaching individuel', 'تدريب فردي')}</p>
                        <p className="text-xs text-gray-500">{getText('Direct messaging with coaches', 'Messagerie directe avec les coachs', 'مراسلة مباشرة مع المدربين')}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate('/subscription')}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg inline-flex items-center gap-2 group"
                    >
                      {subscription?.plan ? getText('Manage Subscription', 'Gérer l\'abonnement', 'إدارة الاشتراك') : getText('View Subscription Plans', 'Voir les plans', 'عرض خطط الاشتراك')}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                    </button>
                  </div>
                  
                  {/* Billing History */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      {getText('Billing History', 'Historique de facturation', 'سجل الفواتير')}
                    </h3>
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">{getText('No billing history available', 'Aucun historique de facturation disponible', 'لا يوجد سجل فواتير متاح')}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Settings