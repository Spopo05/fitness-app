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
  Image, Video, Play, X, Grid, List, ThumbsUp,
  MoreHorizontal, Camera, Edit3, Plus, Info,
  Bookmark, Flag, Settings, LogOut, Menu
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
  const [activeTab, setActiveTab] = useState('posts');
  
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

  const getProfilePictureUrl = () => {
    if (!coach?.profilePicture || imageError) return null;
    if (coach.profilePicture.startsWith('http')) {
      return coach.profilePicture;
    }
    return `http://localhost:5000/${coach.profilePicture}`;
  };

  const getMediaUrl = (mediaPath) => {
    if (mediaPath.startsWith('http')) {
      return mediaPath;
    }
    return `http://localhost:5000/${mediaPath}`;
  };

  // Parse specialties and certifications
  const specialties = coach?.specialty ? coach.specialty.split(',').map(s => s.trim()) : [];
  const certifications = coach?.certifications ? coach.certifications.split(',').map(c => c.trim()) : [];

  // Stats for profile - Only posts count
  const stats = [
    { label: getText('Posts', 'Publications', 'منشورات'), value: mediaData?.length || 0, icon: Image },
  ];

  const tabs = [
    { id: 'posts', label: getText('Posts', 'Publications', 'منشورات'), icon: Image },
    { id: 'about', label: getText('About', 'À propos', 'حول'), icon: Info },
    { id: 'photos', label: getText('Photos', 'Photos', 'صور'), icon: Camera },
    { id: 'videos', label: getText('Videos', 'Vidéos', 'فيديوهات'), icon: Video },
  ];

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

  // Filter media by type
  const photos = mediaData?.filter(m => m.type === 'image') || [];
  const videos = mediaData?.filter(m => m.type === 'video') || [];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cover Photo Section */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-64 md:h-80 lg:h-96 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-0 bg-[url('https://wallpapercave.com/wp/wp15285241.jpg')] bg-cover bg-center opacity-50"></div>
        </div>

        {/* Profile Picture - Overlapping Cover */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20 sm:-mt-24 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white p-1 shadow-xl">
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
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white"></div>
              </div>

              {/* Name & Actions */}
              <div className="flex-1 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{coach.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <BadgeCheck className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-500">
                        {getText('Certified Personal Trainer', 'Entraîneur Personnel Certifié', 'مدرب شخصي معتمد')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {getText('Message', 'Message', 'رسالة')}
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar - Only Posts */}
        <div className="bg-white border-t border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center py-3">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="text-center px-8">
                    <div className="flex items-center justify-center gap-1">
                      <Icon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
                    </div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                      isActive
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - About Info (Facebook style) */}
          <div className="lg:col-span-1 space-y-4">
            {/* Intro Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                {getText('Intro', 'Introduction', 'مقدمة')}
              </h3>
              <div className="space-y-3">
                {coach.bio && (
                  <p className="text-sm text-gray-600">{coach.bio}</p>
                )}
                {coach.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{coach.location}</span>
                  </div>
                )}
                {coach.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>{coach.email}</span>
                  </div>
                )}
                {coach.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="h-4 w-4" />
                    <span>{coach.phone}</span>
                  </div>
                )}
                {coach.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{getText('Joined', 'Inscrit', 'انضم')} {formatDate(coach.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Specialties Card */}
            {specialties.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  {getText('Specialties', 'Spécialités', 'التخصصات')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty, index) => (
                    <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications Card */}
            {certifications.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-500" />
                  {getText('Certifications', 'Certifications', 'الشهادات')}
                </h3>
                <div className="space-y-2">
                  {certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info Card */}
            {(coach.phone || coach.location) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-gray-500" />
                  {getText('Contact Info', 'Coordonnées', 'معلومات الاتصال')}
                </h3>
                <div className="space-y-2">
                  {coach.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-green-500" />
                      <span>{coach.phone}</span>
                    </div>
                  )}
                  {coach.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span>{coach.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Links Card */}
            {(coach.linkedin || coach.instagram || coach.facebook || coach.twitter) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  {getText('Social', 'Réseaux sociaux', 'وسائل التواصل')}
                </h3>
                <div className="flex gap-3">
                  {coach.linkedin && (
                    <a href={coach.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full hover:bg-blue-50 transition">
                      <Linkedin className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                    </a>
                  )}
                  {coach.instagram && (
                    <a href={coach.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full hover:bg-pink-50 transition">
                      <Instagram className="h-5 w-5 text-gray-600 hover:text-pink-600" />
                    </a>
                  )}
                  {coach.facebook && (
                    <a href={coach.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full hover:bg-blue-50 transition">
                      <Facebook className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                    </a>
                  )}
                  {coach.twitter && (
                    <a href={coach.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full hover:bg-sky-50 transition">
                      <Twitter className="h-5 w-5 text-gray-600 hover:text-sky-500" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Posts/Media Feed (Facebook style) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Create Post Card (Facebook style) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0">
                  {getProfilePictureUrl() ? (
                    <img src={getProfilePictureUrl()} alt={coach.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <button className="w-full text-left px-4 py-2 bg-gray-100 rounded-full text-gray-500 text-sm hover:bg-gray-200 transition">
                    {getText("What's on your mind?", "Quoi de neuf ?", "ما الجديد؟")}
                  </button>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {mediaData && mediaData.length > 0 ? (
                  mediaData.map((media, idx) => (
                    <div key={media._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      {/* Post Header */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
                            {getProfilePictureUrl() ? (
                              <img src={getProfilePictureUrl()} alt={coach.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{coach.name}</p>
                            <p className="text-xs text-gray-400">{format(new Date(media.createdAt), 'MMMM dd, yyyy')}</p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Post Content */}
                      {media.title && (
                        <div className="px-4 pb-3">
                          <p className="text-gray-800">{media.title}</p>
                        </div>
                      )}

                      {/* Post Media */}
                      <div 
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedMedia(media);
                          setMediaViewerOpen(true);
                        }}
                      >
                        {media.type === 'video' ? (
                          <div className="relative bg-black">
                            <video 
                              src={getMediaUrl(media.url)} 
                              className="w-full max-h-96 object-contain"
                              poster={media.thumbnail}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play className="h-12 w-12 text-white" />
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={getMediaUrl(media.url)} 
                            alt={media.title || 'Post'} 
                            className="w-full max-h-96 object-cover"
                          />
                        )}
                      </div>

                      {/* Post Actions - Only Like and Comment (No Share) */}
                      <div className="p-4 border-t border-gray-100">
                        <div className="flex justify-center gap-8">
                          <button className="flex items-center gap-2 px-6 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition">
                            <ThumbsUp className="h-5 w-5" />
                            {getText('Like', 'J\'aime', 'إعجاب')}
                          </button>
                          <button className="flex items-center gap-2 px-6 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition">
                            <MessageCircle className="h-5 w-5" />
                            {getText('Comment', 'Commenter', 'تعليق')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                    <Image className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">{getText('No posts yet', 'Aucune publication', 'لا توجد منشورات بعد')}</p>
                  </div>
                )}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{getText('About Coach', 'À propos du coach', 'عن المدرب')}</h3>
                {coach.bio && <p className="text-gray-600 leading-relaxed mb-4">{coach.bio}</p>}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {coach.experience ? `${coach.experience} ${getText('years experience', 'années d\'expérience', 'سنوات خبرة')}` : getText('Experience not specified', 'Expérience non spécifiée', 'الخبرة غير محددة')}
                    </span>
                  </div>
                  {coach.successRate && (
                    <div className="flex items-center gap-3 text-sm">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{coach.successRate} {getText('success rate', 'taux de réussite', 'معدل نجاح')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <div className="grid grid-cols-3 gap-1">
                {photos.map((photo, idx) => (
                  <div 
                    key={photo._id} 
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
                    onClick={() => {
                      setSelectedMedia(photo);
                      setMediaViewerOpen(true);
                    }}
                  >
                    <img 
                      src={getMediaUrl(photo.url)} 
                      alt={photo.title || 'Photo'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {photos.length === 0 && (
                  <div className="col-span-3 text-center py-12">
                    <Camera className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">{getText('No photos yet', 'Aucune photo', 'لا توجد صور بعد')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div className="space-y-3">
                {videos.map((video) => (
                  <div 
                    key={video._id} 
                    className="bg-gray-900 rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => {
                      setSelectedMedia(video);
                      setMediaViewerOpen(true);
                    }}
                  >
                    <div className="relative">
                      <video 
                        src={getMediaUrl(video.url)} 
                        className="w-full max-h-64 object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-12 w-12 text-white bg-black/50 rounded-full p-2" />
                      </div>
                    </div>
                    {video.title && (
                      <div className="p-3 bg-white">
                        <p className="text-gray-800">{video.title}</p>
                      </div>
                    )}
                  </div>
                ))}
                {videos.length === 0 && (
                  <div className="text-center py-12">
                    <Video className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">{getText('No videos yet', 'Aucune vidéo', 'لا توجد فيديوهات بعد')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Viewer Modal */}
      {mediaViewerOpen && selectedMedia && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setMediaViewerOpen(false)}>
          <div className="relative max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMediaViewerOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="bg-black rounded-lg overflow-hidden">
              {selectedMedia.type === 'video' ? (
                <video 
                  src={getMediaUrl(selectedMedia.url)} 
                  controls 
                  autoPlay
                  className="w-full h-auto max-h-[80vh]"
                />
              ) : (
                <img 
                  src={getMediaUrl(selectedMedia.url)} 
                  alt={selectedMedia.title || 'Media'} 
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              )}
            </div>
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