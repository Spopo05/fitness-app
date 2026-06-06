import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { 
  User, Camera, Plus, Trash2, TrendingUp, Calendar, Ruler, Weight, 
  X, Edit2, Check, Activity, Mail, Phone, MapPin, Award, Target,
  Flame, Medal, Sparkles, Clock, Upload, Save, ArrowUp, ArrowDown,
  Settings, Lock, CreditCard, ChevronRight, Heart, Zap, Brain,
  Crown, Star, Shield, Diamond, Gem, Trophy, Compass, Rocket,
  Dumbbell, Menu, XCircle
} from 'lucide-react';
import { format, differenceInDays, subDays } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend, ComposedChart, Bar
} from 'recharts';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [weightValue, setWeightValue] = useState('');
  const [heightValue, setHeightValue] = useState(user?.height || '');
  const [isEditingHeight, setIsEditingHeight] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [showAchievement, setShowAchievement] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRTL = i18n.language === 'ar';
  const isFrench = i18n.language === 'fr';
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const getText = (en, fr, ar) => {
    if (isFrench) return fr;
    if (isRTL) return ar;
    return en;
  };

  // Fetch weight history
  const { data: weightHistory, isLoading: weightLoading } = useQuery({
    queryKey: ['weightHistory'],
    queryFn: async () => {
      const response = await api.get('/users/weight');
      return response.data.data.weightHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
  });

  // Fetch upcoming workouts
  const { data: workouts } = useQuery({
    queryKey: ['upcomingWorkouts'],
    queryFn: async () => {
      const response = await api.get('/users/workouts/upcoming?limit=10');
      return response.data.data.workouts;
    },
  });

  // Fetch diet plans
  const { data: dietPlans } = useQuery({
    queryKey: ['allDietPlans'],
    queryFn: async () => {
      const response = await api.get('/users/diet-plans');
      return response.data.data.dietPlans;
    },
  });

  // Update height mutation
  const updateHeightMutation = useMutation({
    mutationFn: async (height) => {
      const response = await api.patch('/users/profile', { height });
      return response.data.data.user;
    },
    onSuccess: (userData) => {
      updateUser(userData);
      toast.success(getText('Height updated!', 'Taille mise à jour !', 'تم تحديث الطول!'));
      setIsEditingHeight(false);
    },
  });

  // Add weight mutation
  const addWeightMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/users/weight', data);
      return response.data.data.weightHistory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['weightHistory']);
      setWeightValue('');
      setShowWeightForm(false);
      
      const newWeight = parseFloat(weightValue);
      const firstWeight = weightHistory?.[0]?.weight;
      if (firstWeight && firstWeight - newWeight >= 5) {
        setShowAchievement({ type: 'weight_loss', value: firstWeight - newWeight });
        setTimeout(() => setShowAchievement(null), 5000);
      }
      
      toast.success(getText('Weight added!', 'Poids ajouté !', 'تم إضافة الوزن!'));
    },
  });

  // Upload profile picture mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post('/users/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data.user;
    },
    onSuccess: (userData) => {
      updateUser(userData);
      toast.success(getText('Profile picture updated!', 'Photo de profil mise à jour !', 'تم تحديث صورة الملف الشخصي!'));
      setUploading(false);
      setPreviewImage(null);
    },
  });

  // Delete profile picture mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/users/profile-picture');
      return response.data.data.user;
    },
    onSuccess: (userData) => {
      updateUser(userData);
      toast.success(getText('Profile picture removed!', 'Photo de profil supprimée !', 'تم إزالة صورة الملف الشخصي!'));
    },
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(getText('Invalid image format', 'Format d\'image invalide', 'صيغة صورة غير صالحة'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(getText('Image too large (max 5MB)', 'Image trop grande (max 5MB)', 'الصورة كبيرة جداً (حد أقصى 5 ميجابايت)'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('profilePicture', file);
    setUploading(true);
    uploadPhotoMutation.mutate(formData);
  };

  const handleRemovePhoto = () => {
    if (confirm(getText('Remove profile picture?', 'Supprimer la photo de profil ?', 'إزالة صورة الملف الشخصي؟'))) {
      deletePhotoMutation.mutate();
    }
  };

  const handleAddWeight = () => {
    if (!weightValue) {
      toast.error(getText('Enter weight value', 'Entrez une valeur de poids', 'أدخل قيمة الوزن'));
      return;
    }
    addWeightMutation.mutate({
      weight: parseFloat(weightValue),
      date: new Date().toISOString(),
    });
  };

  const handleUpdateHeight = () => {
    if (!heightValue) {
      toast.error(getText('Enter height value', 'Entrez une valeur de taille', 'أدخل قيمة الطول'));
      return;
    }
    updateHeightMutation.mutate(parseFloat(heightValue));
  };

  // Calculate metrics
  const latestWeight = weightHistory?.[weightHistory.length - 1]?.weight;
  const firstWeight = weightHistory?.[0]?.weight;
  const weightChange = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : null;
  const isWeightDown = weightChange && weightChange < 0;
  const totalEntries = weightHistory?.length || 0;
  const weightLoss = isWeightDown ? Math.abs(weightChange) : 0;
  const weightGain = !isWeightDown && weightChange ? Math.abs(weightChange) : 0;

  // BMI Calculation
  const bmi = user?.height && latestWeight ? (latestWeight / ((user.height / 100) ** 2)).toFixed(1) : null;
  const getBMICategory = () => {
    if (!bmi) return null;
    if (bmi < 18.5) return { text: getText('Underweight', 'Insuffisance pondérale', 'نقص الوزن'), color: 'blue' };
    if (bmi < 25) return { text: getText('Normal', 'Normal', 'طبيعي'), color: 'green' };
    if (bmi < 30) return { text: getText('Overweight', 'Surpoids', 'زيادة الوزن'), color: 'yellow' };
    return { text: getText('Obese', 'Obèse', 'سمنة'), color: 'red' };
  };
  const bmiCategory = getBMICategory();

  // Calculate fitness score
  const fitnessScore = (() => {
    let score = 50;
    if (bmi && bmiCategory?.color === 'green') score += 20;
    if (bmi && bmiCategory?.color === 'yellow') score += 10;
    if (weightHistory?.length > 10) score += 15;
    if (weightLoss > 0) score += Math.min(15, weightLoss * 3);
    return Math.min(100, Math.max(0, score));
  })();

  // Calculate streak
  const calculateStreak = () => {
    if (!weightHistory || weightHistory.length === 0) return 0;
    let streak = 0;
    let currentDate = new Date();
    for (let i = weightHistory.length - 1; i >= 0; i--) {
      const entryDate = new Date(weightHistory[i].date);
      const diffDays = differenceInDays(currentDate, entryDate);
      if (diffDays <= 1 && diffDays >= 0) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else if (diffDays === 1) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }
    return streak;
  };
  const streak = calculateStreak();

  // Generate radar data
  const radarData = [
    { subject: getText('Consistency', 'Constance', 'الاستمرارية'), A: Math.min(100, (totalEntries * 10)), fullMark: 100 },
    { subject: getText('Progress', 'Progrès', 'التقدم'), A: Math.min(100, weightLoss * 10 + 50), fullMark: 100 },
    { subject: getText('Nutrition', 'Nutrition', 'التغذية'), A: dietPlans?.length ? Math.min(100, dietPlans.length * 20) : 50, fullMark: 100 },
    { subject: getText('Activity', 'Activité', 'النشاط'), A: workouts?.length ? Math.min(100, workouts.length * 15) : 40, fullMark: 100 },
    { subject: getText('Health', 'Santé', 'الصحة'), A: bmiCategory?.color === 'green' ? 85 : 60, fullMark: 100 },
  ];

  const formatWeightData = (data) => {
    const filtered = data?.slice(-7).map(entry => ({
      date: format(new Date(entry.date), 'MM/dd'),
      weight: entry.weight
    })) || [];
    
    if (latestWeight && weightLoss) {
      const lastDate = new Date(data?.[data.length - 1]?.date);
      for (let i = 1; i <= 7; i++) {
        const futureDate = new Date(lastDate);
        futureDate.setDate(futureDate.getDate() + i);
        filtered.push({
          date: format(futureDate, 'MM/dd'),
          weight: (latestWeight - (weightLoss / 30) * i).toFixed(1),
          predicted: true
        });
      }
    }
    return filtered;
  };

  const tabs = [
    { id: 'overview', icon: User, label: getText('Overview', 'Aperçu', 'نظرة عامة') },
    { id: 'analytics', icon: TrendingUp, label: getText('Analytics', 'Analyses', 'تحليلات') },
    { id: 'radar', icon: Compass, label: getText('360° View', 'Vue 360°', 'رؤية 360°') },
    { id: 'predict', icon: Rocket, label: getText('Predictions', 'Prédictions', 'توقعات') },
    { id: 'achievements', icon: Crown, label: getText('Achievements', 'Réalisations', 'إنجازات') }
  ];

  if (weightLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-6 pb-8">
      {/* Achievement Popup */}
      {showAchievement && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto z-50 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-2xl p-4 max-w-sm animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm sm:text-base">🏆 Achievement Unlocked!</p>
              <p className="text-white/90 text-xs sm:text-sm">Lost {showAchievement.value.toFixed(1)} kg - Keep going!</p>
            </div>
          </div>
        </div>
      )}

{/* Mobile Tab Selector */}
{isMobile && (
  <div className="lg:hidden">
    <button
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      className="w-full bg-white rounded-xl py-3 px-4 flex items-center justify-between shadow-sm border border-gray-200"
    >
      <div className="flex items-center gap-2">
        {(() => {
          const activeTabData = tabs.find(tab => tab.id === activeTab);
          const ActiveIcon = activeTabData?.icon;
          return ActiveIcon ? <ActiveIcon className="h-5 w-5 text-blue-600" /> : null;
        })()}
        <span className="font-medium text-gray-900">
          {tabs.find(tab => tab.id === activeTab)?.label}
        </span>
      </div>
      <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${mobileMenuOpen ? 'rotate-90' : ''}`} />
    </button>
    
    {mobileMenuOpen && (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-2 overflow-hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    )}
  </div>
)}

      {/* Header with AI Insights - Responsive */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              <span className="text-blue-400 text-xs sm:text-sm font-medium uppercase tracking-wide">AI INSIGHTS</span>
            </div>
            <h2 className="text-base sm:text-xl font-bold">
              {getText(
                `Based on your data, you're ${Math.abs(weightChange)} kg ${weightChange < 0 ? 'down' : 'up'} this month`,
                `Basé sur vos données, vous êtes ${Math.abs(weightChange)} kg ${weightChange < 0 ? 'en baisse' : 'en hausse'} ce mois-ci`,
                `بناءً على بياناتك، أنت ${Math.abs(weightChange)} كجم ${weightChange < 0 ? 'لأسفل' : 'لأعلى'} هذا الشهر`
              )}
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm mt-1">
              {getText(
                `Your fitness score is ${fitnessScore}/100. ${fitnessScore > 70 ? 'Excellent progress! 🎉' : 'Keep pushing! 💪'}`,
                `Votre score de fitness est de ${fitnessScore}/100. ${fitnessScore > 70 ? 'Progression excellente ! 🎉' : 'Continuez à pousser ! 💪'}`,
                `درجة لياقتك هي ${fitnessScore}/100. ${fitnessScore > 70 ? 'تقدم ممتاز! 🎉' : 'استمر في الدفع! 💪'}`
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/10 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
              <span className="text-xl sm:text-2xl font-bold">{streak}</span>
              <span className="text-xs sm:text-sm ml-1">{getText('day streak', 'jours de suite', 'يوم متتالي')}</span>
            </div>
            <div className="bg-white/10 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5 inline mr-1 text-orange-400" />
              <span className="text-xs sm:text-sm">{getText('🔥 On Fire!', '🔥 En feu !', '🔥 مشتعل!')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card with Background Image - Responsive */}
      <div 
        className="rounded-xl sm:rounded-2xl shadow-xl overflow-hidden relative"
        style={{
          backgroundImage: `url('https://i.ytimg.com/vi/Ll7a7XRfEZo/maxresdefault.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
          minHeight: '320px'
        }}
      >
        <div 
          className="bg-gradient-to-r from-black/70 via-black/50 to-transparent backdrop-blur-sm p-4 sm:p-6 w-full h-full flex items-center"
          style={{ minHeight: '320px' }}
        >
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start w-full">
            {/* Avatar - Responsive size */}
            <div className="relative group mx-auto sm:mx-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white p-1 shadow-2xl ring-4 ring-white">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : user?.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-1.5 sm:p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {uploading ? <LoadingSpinner size="sm" /> : <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />}
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                className="hidden"
              />
            </div>

            {/* User Info - Responsive text */}
            <div className="flex-1 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{user?.name}</h2>
                  <p className="text-gray-200 text-xs sm:text-sm mt-0.5 drop-shadow break-all">{user?.email}</p>
                  <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                    <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-blue-500/80 text-white backdrop-blur-sm capitalize">
                      <Star className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                      {user?.role}
                    </span>
                    {bmi && (
                      <span className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-${bmiCategory?.color}-500/80 text-white backdrop-blur-sm`}>
                        BMI: {bmi} ({bmiCategory?.text})
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-purple-500/80 text-white backdrop-blur-sm">
                      <Zap className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                      Level {Math.floor(fitnessScore / 10)}
                    </span>
                  </div>
                </div>
                
                {user?.profilePicture && (
                  <button
                    onClick={handleRemovePhoto}
                    disabled={deletePhotoMutation.isPending}
                    className="text-xs sm:text-sm text-white/80 hover:text-white transition-colors px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-white/20 self-center sm:self-start"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                    {getText('Remove', 'Supprimer', 'إزالة')}
                  </button>
                )}
              </div>
              
              {/* Stats Section - Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4">
                <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-white/20">
                  <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 mx-auto mb-1" />
                  <p className="text-sm sm:text-xl font-bold text-white">{workouts?.length || 0}</p>
                  <p className="text-[8px] sm:text-[10px] text-white/50 uppercase">Workouts</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-white/20">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mx-auto mb-1" />
                  <p className="text-sm sm:text-xl font-bold text-white">{weightLoss > 0 ? weightLoss : weightGain > 0 ? weightGain : '—'}</p>
                  <p className="text-[8px] sm:text-[10px] text-white/50 uppercase">{weightLoss > 0 ? 'Lost' : weightGain > 0 ? 'Gained' : 'Goal'}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-white/20">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 mx-auto mb-1" />
                  <p className="text-sm sm:text-xl font-bold text-white">{streak}</p>
                  <p className="text-[8px] sm:text-[10px] text-white/50 uppercase">Streak</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-white/20">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mx-auto mb-1" />
                  <p className="text-sm sm:text-xl font-bold text-white">{fitnessScore}</p>
                  <p className="text-[8px] sm:text-[10px] text-white/50 uppercase">Fitness</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <Weight className="h-4 w-4 sm:h-6 sm:w-6 opacity-80" />
            <span className="text-base sm:text-2xl font-bold">{latestWeight || '—'}</span>
          </div>
          <p className="text-[10px] sm:text-xs opacity-80 mt-1">{getText('Current', 'Actuel', 'الحالي')}</p>
          {weightChange && (
            <p className={`text-[9px] sm:text-xs mt-1 ${isWeightDown ? 'text-green-200' : 'text-red-200'}`}>
              {isWeightDown ? '↓' : '↑'} {Math.abs(weightChange)} kg
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <Target className="h-4 w-4 sm:h-6 sm:w-6 opacity-80" />
            <span className="text-base sm:text-2xl font-bold">{weightLoss.toFixed(1)}</span>
          </div>
          <p className="text-[10px] sm:text-xs opacity-80 mt-1">{getText('Lost', 'Perdu', 'المفقود')}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <Calendar className="h-4 w-4 sm:h-6 sm:w-6 opacity-80" />
            <span className="text-base sm:text-2xl font-bold">{streak}</span>
          </div>
          <p className="text-[10px] sm:text-xs opacity-80 mt-1">{getText('Streak', 'Série', 'سلسلة')}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <Activity className="h-4 w-4 sm:h-6 sm:w-6 opacity-80" />
            <span className="text-base sm:text-2xl font-bold">{totalEntries}</span>
          </div>
          <p className="text-[10px] sm:text-xs opacity-80 mt-1">{getText('Logs', 'Journaux', 'سجلات')}</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-white shadow-lg col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <Trophy className="h-4 w-4 sm:h-6 sm:w-6 opacity-80" />
            <span className="text-base sm:text-2xl font-bold">{fitnessScore}</span>
          </div>
          <p className="text-[10px] sm:text-xs opacity-80 mt-1">{getText('Score', 'Score', 'درجة')}</p>
        </div>
      </div>

      {/* Desktop Tabs - Hidden on mobile */}
      {!isMobile && (
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm rounded-t-2xl overflow-x-auto">
          <div className="flex gap-2 md:gap-6 pb-1 px-4 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-4 font-medium text-sm transition-all rounded-t-xl ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content - Responsive */}
      <div className="bg-white/95 backdrop-blur-md rounded-b-2xl p-4 sm:p-6 shadow-xl overflow-x-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{getText('Height', 'Taille', 'الطول')}</h3>
              </div>
              {!isEditingHeight && (
                <button onClick={() => setIsEditingHeight(true)} className="text-xs sm:text-sm text-blue-600 hover:text-blue-700">
                  {getText('Edit', 'Modifier', 'تعديل')}
                </button>
              )}
            </div>
            
            {isEditingHeight ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  value={heightValue}
                  onChange={(e) => setHeightValue(e.target.value)}
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-xl text-base sm:text-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="cm"
                />
                <span className="text-gray-500">cm</span>
                <button onClick={handleUpdateHeight} className="p-2 sm:p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button onClick={() => setIsEditingHeight(false)} className="p-2 sm:p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            ) : (
              <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                {user?.height ? `${user.height} cm` : getText('Not set', 'Non défini', 'غير محدد')}
              </p>
            )}

            {/* Add Weight Form - Responsive */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getText('Track your weight', 'Suivez votre poids', 'تتبع وزنك')}
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="number"
                  step="0.1"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  placeholder={getText('Enter weight in kg', 'Entrez le poids en kg', 'أدخل الوزن بالكيلوجرام')}
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-gray-200 rounded-xl text-base sm:text-lg focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={handleAddWeight} className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  {getText('Add', 'Ajouter', 'إضافة')}
                </button>
              </div>
            </div>

            {/* Health Metrics Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* BMI Card */}
              <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-5 w-5 text-red-500" />
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">BMI Health</h4>
                </div>
                <div className="relative pt-4">
                  <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mb-1">
                    <span>Under</span>
                    <span>Normal</span>
                    <span>Over</span>
                    <span>Obese</span>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 rounded-full relative">
                    <div className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-white border-2 border-blue-600 rounded-full -top-1" style={{ left: `${Math.min(100, (bmi / 40) * 100)}%`, transform: 'translateX(-50%)' }}></div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{bmi || '—'}</p>
                    <p className={`text-xs sm:text-sm font-medium text-${bmiCategory?.color}-600`}>{bmiCategory?.text}</p>
                  </div>
                </div>
              </div>

              {/* Fitness Level Card */}
              <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Fitness Level</h4>
                </div>
                <div className="relative pt-4">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full" style={{ width: `${fitnessScore}%` }}></div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{fitnessScore}</p>
                    <p className="text-xs sm:text-sm text-gray-500">/ 100</p>
                  </div>
                </div>
              </div>

              {/* Current Streak Card */}
              <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Current Streak</h4>
                </div>
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-orange-500">{streak}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">{getText('days in a row', 'jours consécutifs', 'أيام متتالية')}</p>
                  {streak > 0 && (
                    <div className="mt-3 flex justify-center gap-1">
                      {[...Array(Math.min(streak, 7))].map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full"></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab - Simplified for mobile */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex justify-end gap-2">
              {['week', 'month', '3months'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                    selectedTimeframe === tf
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tf === 'week' ? getText('Week', 'Semaine', 'أسبوع') :
                   tf === 'month' ? getText('Month', 'Mois', 'شهر') :
                   getText('3M', '3M', '3 شهور')}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{getText('Weight Analytics', 'Analyse du poids', 'تحليلات الوزن')}</h3>
                  <p className="text-xs text-gray-500">{getText('Actual vs AI Prediction', 'Réel vs Prédiction IA', 'الفعلي مقابل توقع الذكاء الاصطناعي')}</p>
                </div>
                <div className="flex gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-[10px] sm:text-xs">Actual</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-300 rounded-full border border-blue-500 border-dashed"></div>
                    <span className="text-[10px] sm:text-xs">AI</span>
                  </div>
                </div>
              </div>
              <div className="h-56 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={formatWeightData(weightHistory)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} width={30} domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`${value} kg`, 'Weight']}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} name="Actual" />
                    <Line type="monotone" dataKey="predicted" stroke="#93c5fd" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="AI Prediction" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-white">
                <p className="text-[10px] sm:text-xs opacity-80">Weekly Avg</p>
                <p className="text-sm sm:text-2xl font-bold mt-1">
                  {(weightHistory?.slice(-7).reduce((sum, w) => sum + w.weight, 0) / 7 || 0).toFixed(1)} kg
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-white">
                <p className="text-[10px] sm:text-xs opacity-80">Monthly Change</p>
                <p className="text-sm sm:text-2xl font-bold mt-1">{weightChange ? `${Math.abs(weightChange)} kg` : '—'}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-white">
                <p className="text-[10px] sm:text-xs opacity-80">Total Loss</p>
                <p className="text-sm sm:text-2xl font-bold mt-1">{weightLoss > 0 ? `-${weightLoss}` : `+${weightGain}`} kg</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-white">
                <p className="text-[10px] sm:text-xs opacity-80">BMI Trend</p>
                <p className="text-sm sm:text-2xl font-bold mt-1">{bmi || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* 360° View Tab */}
        {activeTab === 'radar' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-center text-sm sm:text-base">{getText('Your Fitness 360°', 'Votre Fitness 360°', 'لياقتك 360°')}</h3>
            <div className="h-64 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#9ca3af' }} />
                  <Radar name="You" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predict' && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="h-5 w-5 sm:h-6 sm:w-6" />
              <h3 className="text-base sm:text-xl font-bold">AI Goal Prediction</h3>
            </div>
            <p className="text-indigo-100 text-xs sm:text-sm mb-4">
              {getText(
                `Based on your current rate, you'll reach your goal in approximately ${Math.ceil((weightLoss || weightGain) / (Math.abs(weightChange) / (weightHistory?.length || 1) + 0.01))} days!`,
                `Basé sur votre rythme actuel, vous atteindrez votre objectif dans environ ${Math.ceil((weightLoss || weightGain) / (Math.abs(weightChange) / (weightHistory?.length || 1) + 0.01))} jours !`,
                `بناءً على معدلك الحالي، ستحقق هدفك في حوالي ${Math.ceil((weightLoss || weightGain) / (Math.abs(weightChange) / (weightHistory?.length || 1) + 0.01))} يومًا!`
              )}
            </p>
            <div className="flex gap-2 sm:gap-4 mt-4">
              <div className="bg-white/20 rounded-lg p-2 sm:p-3 flex-1 text-center">
                <p className="text-xl sm:text-2xl font-bold">{Math.ceil((weightLoss || weightGain) / 0.5)}</p>
                <p className="text-[10px] sm:text-xs opacity-80">{getText('Days to Goal', 'Jours', 'أيام للهدف')}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-2 sm:p-3 flex-1 text-center">
                <p className="text-sm sm:text-xl font-bold">{new Date(Date.now() + Math.ceil((weightLoss || weightGain) / 0.5) * 86400000).toLocaleDateString()}</p>
                <p className="text-[10px] sm:text-xs opacity-80">{getText('Projected Date', 'Date', 'التاريخ المتوقع')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              { icon: '🎯', name: 'First Step', desc: getText('Add first weight', 'Ajoutez votre premier poids', 'أضف أول وزن'), achieved: totalEntries > 0, progress: totalEntries > 0 ? 100 : 0 },
              { icon: '📊', name: 'Data Tracker', desc: getText('Log weight for 7 days', '7 jours d\'enregistrement', 'سجل الوزن 7 أيام'), achieved: totalEntries >= 7, progress: Math.min(100, (totalEntries / 7) * 100) },
              { icon: '💪', name: 'Strength Builder', desc: getText('Complete 10 workouts', '10 entraînements', 'أكمل 10 تمارين'), achieved: workouts?.length >= 10, progress: Math.min(100, ((workouts?.length || 0) / 10) * 100) },
              { icon: '⚖️', name: 'Weight Warrior', desc: getText('Lose 5 kg total', 'Perdez 5 kg', 'تفقد 5 كجم'), achieved: weightLoss >= 5, progress: Math.min(100, (weightLoss / 5) * 100) },
              { icon: '🔥', name: 'On Fire', desc: getText('30 day streak', '30 jours de suite', 'سلسلة 30 يوم'), achieved: streak >= 30, progress: Math.min(100, (streak / 30) * 100) },
              { icon: '🏆', name: 'Fitness Master', desc: getText('Reach fitness score 90+', 'Score 90+', 'درجة لياقة 90+'), achieved: fitnessScore >= 90, progress: fitnessScore },
            ].map((achievement, idx) => (
              <div key={idx} className={`bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-sm border ${achievement.achieved ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="text-2xl sm:text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{achievement.name}</h4>
                      {achievement.achieved && <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />}
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{achievement.desc}</p>
                    <div className="mt-2 sm:mt-3 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${achievement.progress}%` }}></div>
                    </div>
                    <p className="text-[8px] sm:text-xs text-gray-400 mt-1">{achievement.progress.toFixed(0)}% complete</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;