import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User, Mail, Phone, MapPin, Star, Award, Users, Target, 
  Briefcase, Calendar, MessageCircle, Linkedin, Instagram, 
  Facebook, Twitter, CheckCircle, TrendingUp, Heart,
  Quote, Sparkles, Crown, Shield, Clock, BadgeCheck,
  Dumbbell, Apple, Activity, Zap, ChevronRight, CalendarDays,
  GraduationCap, Trophy, Medal, Globe, BookOpen,
  Image, Video, Play, X, Grid, List
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useState } from 'react';

const CoachProfileView = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  const isRTL = i18n.language === 'ar';
  const isFrench = i18n.language === 'fr';

  const getText = (en, fr, ar) => {
    if (isFrench) return fr;
    if (isRTL) return ar;
    return en;
  };

  // Fetch coach info
  const { data: coach, isLoading, error } = useQuery({
    queryKey: ['coach'],
    queryFn: async () => {
      const response = await api.get('/users/coach');
      return response.data.data.coach;
    },
    retry: false,
  });

  // Fetch coach media
  const { data: mediaData, isLoading: mediaLoading } = useQuery({
    queryKey: ['coachMedia', coach?._id],
    queryFn: async () => {
      if (!coach?._id) return [];
      const response = await api.get(`/coaches/${coach._id}/media/public`);
      return response.data.data?.media || [];
    },
    enabled: !!coach?._id,
    retry: false,
  });

  const handleSendMessage = () => {
    if (coach?._id) {
      navigate(`/messages?userId=${coach._id}`);
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    try {
      return format(new Date(date), 'MMMM yyyy');
    } catch {
      return null;
    }
  };

  // Helper to get profile picture URL
  const getProfilePictureUrl = () => {
    if (!coach?.profilePicture || imageError) return null;
    if (coach.profilePicture.startsWith('http')) {
      return coach.profilePicture;
    }
    return `http://localhost:5000/${coach.profilePicture}`;
  };

  // Helper to get media URL
  const getMediaUrl = (mediaPath) => {
    if (mediaPath.startsWith('http')) {
      return mediaPath;
    }
    return `http://localhost:5000/${mediaPath}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {getText('No Coach Assigned', 'Aucun Coach Assigné', 'لا يوجد مدرب معين')}
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          {getText('A coach will be assigned to you soon.', 'Un coach vous sera bientôt assigné.', 'سيتم تعيين مدرب لك قريباً.')}
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
        >
          {getText('Back to Dashboard', 'Retour au Tableau de bord', 'العودة إلى لوحة التحكم')}
        </button>
      </div>
    );
  }

  // Parse specialties and certifications
  const specialties = coach.specialty ? coach.specialty.split(',').map(s => s.trim()) : [];
  const certifications = coach.certifications ? coach.certifications.split(',').map(c => c.trim()) : [];

  // Stats array
  const stats = [];
  if (coach.experience) {
    stats.push({ 
      label: getText('Years Experience', 'Années d\'expérience', 'سنوات الخبرة'), 
      value: coach.experience, 
      icon: Award, 
      color: 'amber',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    });
  }
  if (coach.successRate) {
    stats.push({ 
      label: getText('Success Rate', 'Taux de réussite', 'معدل النجاح'), 
      value: coach.successRate, 
      icon: TrendingUp, 
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    });
  }
  if (coach.clientCount) {
    stats.push({ 
      label: getText('Happy Clients', 'Clients satisfaits', 'عملاء سعداء'), 
      value: coach.clientCount, 
      icon: Users, 
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    });
  }

  const hasContactInfo = coach.phone || coach.location;
  const hasSocialLinks = coach.linkedin || coach.instagram || coach.facebook || coach.twitter;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 ${isRTL ? 'text-right' : ''}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          
          <div className={`relative px-6 py-8 flex flex-col md:flex-row items-center gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-sm p-1 shadow-2xl ring-4 ring-white/30 hover:ring-white/50 transition-all">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
                  {getProfilePictureUrl() ? (
                    <img 
                      src={getProfilePictureUrl()} 
                      alt={coach.name} 
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white animate-pulse"></div>
            </div>
            
            {/* Info */}
            <div className={`text-center md:text-left flex-1 ${isRTL ? 'md:text-right' : ''}`}>
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <Crown className="h-4 w-4 text-yellow-400" />
                <span className="text-xs font-medium text-yellow-200 uppercase tracking-wide">
                  {getText('Elite Coach', 'Coach Elite', 'مدرب نخبة')}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{coach.name}</h1>
              <p className="text-blue-100 text-sm mt-1 flex items-center gap-1 justify-center md:justify-start">
                <Mail className="h-3 w-3" />
                {coach.email}
              </p>
              <div className={`flex flex-wrap gap-2 mt-3 ${isRTL ? 'md:justify-start justify-center' : 'justify-center md:justify-start'}`}>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3" />
                  {getText('Certified Trainer', 'Entraîneur Certifié', 'مدرب معتمد')}
                </span>
                {coach.createdAt && (
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {getText('Since', 'Depuis', 'منذ')} {formatDate(coach.createdAt)}
                  </span>
                )}
                {specialties.length > 0 && (
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {specialties[0]}
                  </span>
                )}
              </div>
            </div>
            
            {/* Message Button */}
            <button
              onClick={handleSendMessage}
              className="px-5 py-2.5 bg-white text-purple-600 rounded-xl font-medium hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2 group"
            >
              <MessageCircle className="h-4 w-4 group-hover:scale-110 transition" />
              {getText('Send Message', 'Envoyer un message', 'إرسال رسالة')}
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`p-3 ${stat.bgColor} rounded-xl group-hover:scale-110 transition`}>
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ==================== MEDIA GALLERY SECTION ==================== */}
        {mediaData && mediaData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-pink-50 rounded-lg">
                    <Image className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{getText('Coach Gallery', 'Galerie du Coach', 'معرض المدرب')}</h3>
                    <p className="text-xs text-gray-500">{getText('Photos and videos shared by your coach', 'Photos et vidéos partagées par votre coach', 'الصور ومقاطع الفيديو التي شاركها مدربك')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* View Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {mediaLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className={`p-5 ${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'}`}>
                {mediaData.map((media) => (
                  <div 
                    key={media._id} 
                    className={`group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all cursor-pointer ${viewMode === 'list' ? 'flex items-center gap-4 p-3' : ''}`}
                    onClick={() => {
                      setSelectedMedia(media);
                      setMediaViewerOpen(true);
                    }}
                  >
                    {/* Media Preview */}
                    <div className={`${viewMode === 'grid' ? 'aspect-square' : 'w-20 h-20 rounded-lg overflow-hidden flex-shrink-0'}`}>
                      {media.type === 'video' ? (
                        <div className="relative w-full h-full bg-black">
                          <video 
                            src={getMediaUrl(media.url)} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={getMediaUrl(media.url)} 
                          alt={media.title || 'Media'} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      )}
                    </div>
                    
                    {/* Media Info */}
                    <div className={`flex-1 ${viewMode === 'grid' ? 'p-3' : ''}`}>
                      {media.title && (
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{media.title}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(media.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Bio & Specialties */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Bio Section */}
            {coach.bio && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Quote className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {getText('About Coach', 'À propos du coach', 'عن المدرب')}
                  </h3>
                </div>
                <p className={`text-gray-600 leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                  {coach.bio}
                </p>
              </div>
            )}

            {/* Specialties */}
            {specialties.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {getText('Specialties & Expertise', 'Spécialités & Expertise', 'التخصصات والخبرات')}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty, index) => (
                    <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {getText('Certifications', 'Certifications', 'الشهادات')}
                  </h3>
                </div>
                <div className="space-y-3">
                  {certifications.map((cert, index) => (
                    <div key={index} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''} p-2 bg-gray-50 rounded-lg`}>
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!coach.bio && specialties.length === 0 && certifications.length === 0 && stats.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {getText('Getting to Know Your Coach', 'Apprendre à connaître votre coach', 'التعرف على مدربك')}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {getText(
                    'Your coach is preparing their profile. Send them a message to start your fitness journey!',
                    'Votre coach prépare son profil. Envoyez-lui un message pour commencer votre parcours fitness !',
                    'يقوم مدربك بإعداد ملفه الشخصي. أرسل له رسالة لبدء رحلتك اللياقية!'
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-6">
            
            {/* Contact Info */}
            {(hasContactInfo || coach.email) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {getText('Contact Information', 'Coordonnées', 'معلومات الاتصال')}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 text-sm p-2 hover:bg-gray-50 rounded-lg transition ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-600 break-all">{coach.email}</span>
                  </div>
                  {coach.phone && (
                    <div className={`flex items-center gap-3 text-sm p-2 hover:bg-gray-50 rounded-lg transition ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{coach.phone}</span>
                    </div>
                  )}
                  {coach.location && (
                    <div className={`flex items-center gap-3 text-sm p-2 hover:bg-gray-50 rounded-lg transition ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="text-gray-600">{coach.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Links */}
            {hasSocialLinks && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {getText('Connect With Coach', 'Connectez-vous avec le coach', 'تواصل مع المدرب')}
                  </h3>
                </div>
                <div className="flex gap-3">
                  {coach.linkedin && (
                    <a 
                      href={coach.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2.5 bg-gray-100 rounded-xl hover:bg-blue-50 transition-all group"
                    >
                      <Linkedin className="h-5 w-5 text-gray-500 group-hover:text-blue-600 group-hover:scale-110 transition" />
                    </a>
                  )}
                  {coach.instagram && (
                    <a 
                      href={coach.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2.5 bg-gray-100 rounded-xl hover:bg-pink-50 transition-all group"
                    >
                      <Instagram className="h-5 w-5 text-gray-500 group-hover:text-pink-600 group-hover:scale-110 transition" />
                    </a>
                  )}
                  {coach.facebook && (
                    <a 
                      href={coach.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2.5 bg-gray-100 rounded-xl hover:bg-blue-50 transition-all group"
                    >
                      <Facebook className="h-5 w-5 text-gray-500 group-hover:text-blue-600 group-hover:scale-110 transition" />
                    </a>
                  )}
                  {coach.twitter && (
                    <a 
                      href={coach.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2.5 bg-gray-100 rounded-xl hover:bg-sky-50 transition-all group"
                    >
                      <Twitter className="h-5 w-5 text-gray-500 group-hover:text-sky-500 group-hover:scale-110 transition" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 border border-blue-100">
              <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {getText('Ready to start?', 'Prêt à commencer ?', 'هل أنت مستعد للبدء؟')}
                </h3>
              </div>
              <p className={`text-sm text-gray-600 mb-4 ${isRTL ? 'text-right' : ''}`}>
                {getText(
                  'Get personalized workout plans and nutrition guidance from your coach.',
                  'Obtenez des plans d\'entraînement personnalisés et des conseils nutritionnels de votre coach.',
                  'احصل على خطط تمرين مخصصة وإرشادات غذائية من مدربك.'
                )}
              </p>
              <button
                onClick={handleSendMessage}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md flex items-center justify-center gap-2 group"
              >
                <MessageCircle className="h-4 w-4 group-hover:scale-110 transition" />
                {getText('Message Your Coach', 'Envoyer un message à votre coach', 'راسل مدربك')}
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </button>
            </div>

            {/* Expertise Badges */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {getText('What You Get', 'Ce que vous obtenez', 'ما ستحصل عليه')}
                </h3>
              </div>
              <div className="space-y-3">
                <div className={`flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Dumbbell className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-600">{getText('Personalized Workout Plans', 'Plans d\'entraînement personnalisés', 'خطط تمارين مخصصة')}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Apple className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">{getText('Custom Nutrition Guidance', 'Conseils nutritionnels personnalisés', 'إرشادات غذائية مخصصة')}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MessageCircle className="h-4 w-4 text-purple-500" />
                  <span className="text-gray-600">{getText('24/7 Messaging Support', 'Support par messagerie 24/7', 'دعم عبر المراسلة 24/7')}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Activity className="h-4 w-4 text-orange-500" />
                  <span className="text-gray-600">{getText('Progress Tracking', 'Suivi des progrès', 'تتبع التقدم')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="text-center py-6">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Quote className="h-5 w-5 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 italic max-w-2xl">
              {getText(
                'Your coach is here to guide you every step of the way. Don\'t hesitate to reach out!',
                'Votre coach est là pour vous guider à chaque étape. N\'hésitez pas à le contacter !',
                'مدربك هنا لإرشادك في كل خطوة على الطريق. لا تتردد في التواصل!'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Media Viewer Modal */}
      {mediaViewerOpen && selectedMedia && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setMediaViewerOpen(false)}>
          <div className="relative max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMediaViewerOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition"
            >
              <X className="h-6 w-6" />
            </button>
            {selectedMedia.type === 'video' ? (
              <video 
                src={getMediaUrl(selectedMedia.url)} 
                controls 
                autoPlay
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <img 
                src={getMediaUrl(selectedMedia.url)} 
                alt={selectedMedia.title || 'Media'} 
                className="w-full h-auto rounded-lg"
              />
            )}
            {selectedMedia.title && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white bg-black/50 inline-block px-4 py-2 rounded-full text-sm">
                  {selectedMedia.title}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachProfileView;