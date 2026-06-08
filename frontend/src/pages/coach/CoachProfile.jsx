import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  User, Camera, Plus, Trash2, TrendingUp, Calendar, Ruler, Weight, X, Edit2, Check, 
  Activity, Award, Flame, Zap, Target, Briefcase, Star, Users, Clock, Mail, Phone, 
  MapPin, Linkedin, Instagram, Facebook, Twitter, Save, AlertCircle, Globe,
  Heart, Shield, Sparkles, Crown, ChevronRight, MessageCircle, BookOpen, Video,
  Image, Play, Pause, Volume2, VolumeX, Maximize, Grid, List, Upload, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProfilePictureModal from '../../components/ProfilePictureModal';

const CoachProfile = () => {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const mediaInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  const isRTL = i18n.language === 'ar';
  const isFrench = i18n.language === 'fr';

  const getText = (en, fr, ar) => {
    if (isFrench) return fr;
    if (isRTL) return ar;
    return en;
  };
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    bio: user?.bio || '',
    specialty: user?.specialty || '',
    certifications: user?.certifications || '',
    experience: user?.experience || '',
    clientCount: user?.clientCount || '',
    successRate: user?.successRate || '',
    phone: user?.phone || '',
    location: user?.location || '',
    linkedin: user?.linkedin || '',
    instagram: user?.instagram || '',
    facebook: user?.facebook || '',
    twitter: user?.twitter || '',
  });

  // Fetch coach's media posts
  const { data: mediaPosts, isLoading: mediaLoading, refetch: refetchMedia } = useQuery({
    queryKey: ['coachMedia'],
    queryFn: async () => {
      const response = await api.get('/coaches/media');
      return response.data.data?.media || [];
    },
  });

  // Fetch coach's clients count
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['coachUsers'],
    queryFn: async () => {
      const response = await api.get('/coaches/users');
      return response.data.data.users || [];
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.patch('/users/profile', data);
      return response.data.data.user;
    },
    onSuccess: (userData) => {
      updateUser(userData);
      toast.success(getText('Profile updated successfully', 'Profil mis à jour', 'تم تحديث الملف الشخصي بنجاح'));
      setEditingSection(null);
      queryClient.invalidateQueries(['coachProfile']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || getText('Failed to update profile', 'Échec de la mise à jour', 'فشل تحديث الملف الشخصي'));
    },
  });

  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post('/coaches/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    },
    onSuccess: () => {
      toast.success(getText('Media uploaded successfully', 'Média téléchargé avec succès', 'تم رفع الوسائط بنجاح'));
      setUploadingMedia(false);
      refetchMedia();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || getText('Failed to upload media', 'Échec du téléchargement', 'فشل رفع الوسائط'));
      setUploadingMedia(false);
    },
  });

  // Delete media mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaId) => {
      const response = await api.delete(`/coaches/media/${mediaId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success(getText('Media deleted', 'Média supprimé', 'تم حذف الوسائط'));
      refetchMedia();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || getText('Failed to delete media', 'Échec de la suppression', 'فشل حذف الوسائط'));
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post('/users/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data.user;
    },
    onSuccess: (userData) => {
      updateUser(userData);
      toast.success(getText('Photo updated', 'Photo mise à jour', 'تم تحديث الصورة'));
      setUploading(false);
      setImageError(false);
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/users/profile-picture');
      return response.data.data.user;
    },
    onSuccess: (userData) => {
      updateUser(userData);
      toast.success(getText('Photo removed', 'Photo supprimée', 'تم إزالة الصورة'));
    },
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(getText('Image must be less than 5MB', 'L\'image doit être inférieure à 5 Mo', 'يجب أن تكون الصورة أقل من 5 ميجابايت'));
      return;
    }
    const formData = new FormData();
    formData.append('profilePicture', file);
    setUploading(true);
    uploadPhotoMutation.mutate(formData);
  };

  const handleMediaSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const maxSize = 50 * 1024 * 1024; // 50MB for videos
    if (file.size > maxSize) {
      toast.error(getText('File must be less than 50MB', 'Le fichier doit être inférieur à 50 Mo', 'يجب أن يكون الملف أقل من 50 ميجابايت'));
      return;
    }
    
    const formData = new FormData();
    formData.append('media', file);
    formData.append('type', file.type.startsWith('video/') ? 'video' : 'image');
    setUploadingMedia(true);
    uploadMediaMutation.mutate(formData);
  };

  const handleSave = (field, value) => {
    updateProfileMutation.mutate({ [field]: value });
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
    if (!user?.profilePicture || imageError) return null;
    if (user.profilePicture.startsWith('http')) {
      return user.profilePicture;
    }
    return `http://localhost:5000/${user.profilePicture}`;
  };

  const getMediaUrl = (mediaPath) => {
    if (mediaPath.startsWith('http')) {
      return mediaPath;
    }
    return `http://localhost:5000/${mediaPath}`;
  };

  // Stats for display
  const displayStats = [
    { label: getText('Total Clients', 'Clients totaux', 'إجمالي العملاء'), value: clients?.length || 0, icon: Users, color: 'blue', bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: getText('Active Plans', 'Plans actifs', 'الخطط النشطة'), value: clients?.filter(c => c.dietPlan)?.length || 0, icon: Target, color: 'green', bgColor: 'bg-green-50', iconColor: 'text-green-600' },
  ];

  if (profileData.experience) {
    displayStats.push({ label: getText('Years Experience', 'Années d\'expérience', 'سنوات الخبرة'), value: profileData.experience, icon: Award, color: 'purple', bgColor: 'bg-purple-50', iconColor: 'text-purple-600' });
  }
  if (profileData.successRate) {
    displayStats.push({ label: getText('Success Rate', 'Taux de réussite', 'معدل النجاح'), value: profileData.successRate, icon: TrendingUp, color: 'orange', bgColor: 'bg-orange-50', iconColor: 'text-orange-600' });
  }

  const specialties = profileData.specialty ? profileData.specialty.split(',').map(s => s.trim()) : [];
  const certifications = profileData.certifications ? profileData.certifications.split(',').map(c => c.trim()) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Hero Profile Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative px-6 py-8 flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <button
                onClick={() => setShowProfileModal(true)}
                className="focus:outline-none"
              >
                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm p-1 shadow-2xl ring-4 ring-white/20 hover:ring-white/40 transition-all">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
                    {getProfilePictureUrl() ? (
                      <img 
                        src={getProfilePictureUrl()} 
                        alt={user?.name} 
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-10 w-10 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-1 right-1 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-50 transition"
              >
                {uploading ? <LoadingSpinner size="sm" /> : <Camera className="h-3 w-3 text-gray-600" />}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
            </div>
            
            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{user?.name}</h1>
              <p className="text-blue-100 text-sm mt-1 flex items-center justify-center md:justify-start gap-1">
                <Mail className="h-3 w-3" />
                {user?.email}
              </p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {getText('Certified Coach', 'Coach Certifié', 'مدرب معتمد')}
                </span>
                {user?.createdAt && (
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {getText('Since', 'Depuis', 'منذ')} {formatDate(user.createdAt)}
                  </span>
                )}
                <span className="px-3 py-1 bg-yellow-500/20 backdrop-blur-sm rounded-full text-xs font-medium text-yellow-200 flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  {getText('Elite Coach', 'Coach Elite', 'مدرب نخبة')}
                </span>
              </div>
            </div>
            
            {/* Remove Photo Button */}
            {user?.profilePicture && (
              <button
                onClick={() => deletePhotoMutation.mutate()}
                className="text-white/60 hover:text-white/90 transition text-sm flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                {getText('Remove', 'Supprimer', 'إزالة')}
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${stat.bgColor} rounded-xl`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Media Gallery Section - NEW */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <Image className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{getText('Media Gallery', 'Galerie Média', 'معرض الوسائط')}</h3>
                  <p className="text-xs text-gray-500">{getText('Share photos and videos with your clients', 'Partagez des photos et vidéos avec vos clients', 'شارك الصور ومقاطع الفيديو مع عملائك')}</p>
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
                {/* Upload Button */}
                <button
                  onClick={() => mediaInputRef.current?.click()}
                  disabled={uploadingMedia}
                  className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg text-sm font-medium hover:from-pink-600 hover:to-rose-600 transition flex items-center gap-2"
                >
                  {uploadingMedia ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {getText('Upload', 'Télécharger', 'رفع')}
                </button>
                <input type="file" ref={mediaInputRef} onChange={handleMediaSelect} accept="image/*,video/*" className="hidden" />
              </div>
            </div>
          </div>
          
          {mediaLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : mediaPosts?.length > 0 ? (
            <div className={`p-5 ${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'}`}>
              {mediaPosts.map((media) => (
                <div key={media._id} className={`group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all ${viewMode === 'list' ? 'flex items-center gap-4 p-3' : ''}`}>
                  {/* Media Preview */}
                  <div 
                    className={`cursor-pointer ${viewMode === 'grid' ? 'aspect-square' : 'w-20 h-20 rounded-lg overflow-hidden flex-shrink-0'}`}
                    onClick={() => {
                      setSelectedMedia(media);
                      setMediaViewerOpen(true);
                    }}
                  >
                    {media.type === 'video' ? (
                      <div className="relative w-full h-full bg-black">
                        <video 
                          src={getMediaUrl(media.url)} 
                          className="w-full h-full object-cover"
                          poster={media.thumbnail}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
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
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (window.confirm(getText('Delete this media?', 'Supprimer ce média ?', 'حذف هذه الوسائط؟'))) {
                        deleteMediaMutation.mutate(media._id);
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Image className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">{getText('No media uploaded yet', 'Aucun média téléchargé', 'لا توجد وسائط مرفوعة بعد')}</p>
              <p className="text-xs text-gray-400 mt-1">{getText('Share photos and videos to engage with your clients', 'Partagez des photos et vidéos pour interagir avec vos clients', 'شارك الصور ومقاطع الفيديو للتفاعل مع عملائك')}</p>
            </div>
          )}
        </div>

        {/* Rest of the profile sections... */}
        {/* (Keep all the existing sections: Bio, Specialties, Certifications, etc.) */}
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Professional Bio Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">{getText('Professional Bio', 'Bio professionnelle', 'السيرة المهنية')}</h3>
              </div>
              {editingSection !== 'bio' ? (
                <button onClick={() => setEditingSection('bio')} className="text-gray-400 hover:text-blue-500 transition">
                  <Edit2 className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={() => setEditingSection(null)} className="text-gray-400 hover:text-red-500 transition">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {editingSection === 'bio' ? (
              <div className="space-y-3">
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition"
                  placeholder={getText(
                    "Tell your clients about yourself, your coaching philosophy, and approach...",
                    "Parlez à vos clients de vous-même, de votre philosophie de coaching et de votre approche...",
                    "أخبر عملائك عن نفسك وفلسفتك التدريبية ونهجك..."
                  )}
                />
                <div className="flex gap-2">
                  <button onClick={() => handleSave('bio', profileData.bio)} className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm flex items-center gap-1">
                    <Save className="h-3 w-3" /> {getText('Save', 'Enregistrer', 'حفظ')}
                  </button>
                  <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">
                    {getText('Cancel', 'Annuler', 'إلغاء')}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm leading-relaxed">
                {profileData.bio || getText(
                  'No bio added yet. Click edit to add your professional information.',
                  'Aucune bio ajoutée. Cliquez sur modifier pour ajouter vos informations professionnelles.',
                  'لا توجد سيرة ذاتية مضافة بعد. انقر على تعديل لإضافة معلوماتك المهنية.'
                )}
              </p>
            )}
          </div>

          {/* Specialties Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-800">{getText('Specialties', 'Spécialités', 'التخصصات')}</h3>
              </div>
              {editingSection !== 'specialty' ? (
                <button onClick={() => setEditingSection('specialty')} className="text-gray-400 hover:text-blue-500 transition">
                  <Edit2 className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={() => setEditingSection(null)} className="text-gray-400 hover:text-red-500 transition">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {editingSection === 'specialty' ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={profileData.specialty}
                  onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition"
                  placeholder={getText(
                    "Weight Loss, Strength Training, Nutrition, etc. (comma separated)",
                    "Perte de poids, musculation, nutrition, etc. (séparés par des virgules)",
                    "فقدان الوزن، تدريب القوة، التغذية، إلخ. (مفصولة بفواصل)"
                  )}
                />
                <p className="text-xs text-gray-400">{getText('Separate multiple specialties with commas', 'Séparez plusieurs spécialités par des virgules', 'افصل بين التخصصات المتعددة بفواصل')}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleSave('specialty', profileData.specialty)} className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm flex items-center gap-1">
                    <Save className="h-3 w-3" /> {getText('Save', 'Enregistrer', 'حفظ')}
                  </button>
                  <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">
                    {getText('Cancel', 'Annuler', 'إلغاء')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {specialties.length > 0 ? (
                  specialties.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {s}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">{getText('No specialties added yet', 'Aucune spécialité ajoutée', 'لا توجد تخصصات مضافة بعد')}</p>
                )}
              </div>
            )}
          </div>

          {/* Certifications Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Award className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800">{getText('Certifications', 'Certifications', 'الشهادات')}</h3>
              </div>
              {editingSection !== 'certifications' ? (
                <button onClick={() => setEditingSection('certifications')} className="text-gray-400 hover:text-blue-500 transition">
                  <Edit2 className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={() => setEditingSection(null)} className="text-gray-400 hover:text-red-500 transition">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {editingSection === 'certifications' ? (
              <div className="space-y-3">
                <textarea
                  value={profileData.certifications}
                  onChange={(e) => setProfileData({ ...profileData, certifications: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition"
                  placeholder={getText(
                    "Certified Personal Trainer (CPT), Nutrition Specialist, etc. (comma separated)",
                    "Certified Personal Trainer (CPT), Nutrition Specialist, etc. (séparés par des virgules)",
                    "مدرب شخصي معتمد (CPT)، أخصائي تغذية، إلخ. (مفصولة بفواصل)"
                  )}
                />
                <p className="text-xs text-gray-400">{getText('Separate multiple certifications with commas', 'Séparez plusieurs certifications par des virgules', 'افصل بين الشهادات المتعددة بفواصل')}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleSave('certifications', profileData.certifications)} className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm flex items-center gap-1">
                    <Save className="h-3 w-3" /> {getText('Save', 'Enregistrer', 'حفظ')}
                  </button>
                  <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">
                    {getText('Cancel', 'Annuler', 'إلغاء')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {certifications.length > 0 ? (
                  certifications.map((cert, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700 text-sm">{cert}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">{getText('No certifications added yet', 'Aucune certification ajoutée', 'لا توجد شهادات مضافة بعد')}</p>
                )}
              </div>
            )}
          </div>

          {/* Experience & Stats Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">{getText('Experience & Stats', 'Expérience et statistiques', 'الخبرة والإحصائيات')}</h3>
            </div>
            <div className="space-y-4">
              {/* Years Experience */}
              <div>
                <label className="text-sm text-gray-600 block mb-1">{getText('Years of Experience', 'Années d\'expérience', 'سنوات الخبرة')}</label>
                {editingSection === 'experience' ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profileData.experience}
                      onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition"
                      placeholder={getText("e.g., 5+ years", "ex: 5+ ans", "مثال: 5+ سنوات")}
                    />
                    <button onClick={() => handleSave('experience', profileData.experience)} className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm">
                      <Save className="h-3 w-3" />
                    </button>
                    <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">
                      {getText('Cancel', 'Annuler', 'إلغاء')}
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-800">{profileData.experience || getText('Not set', 'Non défini', 'غير محدد')}</p>
                    <button onClick={() => setEditingSection('experience')} className="text-gray-400 hover:text-blue-500 transition">
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Success Rate */}
              <div>
                <label className="text-sm text-gray-600 block mb-1">{getText('Success Rate', 'Taux de réussite', 'معدل النجاح')}</label>
                {editingSection === 'successRate' ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profileData.successRate}
                      onChange={(e) => setProfileData({ ...profileData, successRate: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition"
                      placeholder={getText("e.g., 94%", "ex: 94%", "مثال: 94%")}
                    />
                    <button onClick={() => handleSave('successRate', profileData.successRate)} className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm">
                      <Save className="h-3 w-3" />
                    </button>
                    <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">
                      {getText('Cancel', 'Annuler', 'إلغاء')}
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-800">{profileData.successRate || getText('Not set', 'Non défini', 'غير محدد')}</p>
                    <button onClick={() => setEditingSection('successRate')} className="text-gray-400 hover:text-blue-500 transition">
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Phone className="h-4 w-4 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-800">{getText('Contact Information', 'Coordonnées', 'معلومات الاتصال')}</h3>
            </div>
            <div className="space-y-4">
              {/* Phone */}
              <div>
                <label className="text-sm text-gray-600 block mb-1 flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {getText('Phone Number', 'Numéro de téléphone', 'رقم الهاتف')}
                </label>
                {editingSection === 'phone' ? (
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="+1 234 567 8900"
                    />
                    <button onClick={() => handleSave('phone', profileData.phone)} className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm">
                      <Save className="h-3 w-3" />
                    </button>
                    <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">
                      {getText('Cancel', 'Annuler', 'إلغاء')}
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-800">{profileData.phone || getText('Not set', 'Non défini', 'غير محدد')}</p>
                    <button onClick={() => setEditingSection('phone')} className="text-gray-400 hover:text-blue-500 transition">
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="text-sm text-gray-600 block mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {getText('Location', 'Emplacement', 'الموقع')}
                </label>
                {editingSection === 'location' ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition"
                      placeholder={getText("City, Country or Online", "Ville, pays ou en ligne", "مدينة، بلد أو عبر الإنترنت")}
                    />
                    <button onClick={() => handleSave('location', profileData.location)} className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm">
                      <Save className="h-3 w-3" />
                    </button>
                    <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">
                      {getText('Cancel', 'Annuler', 'إلغاء')}
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-800">{profileData.location || getText('Not set', 'Non défini', 'غير محدد')}</p>
                    <button onClick={() => setEditingSection('location')} className="text-gray-400 hover:text-blue-500 transition">
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Globe className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">{getText('Social Links', 'Liens sociaux', 'روابط التواصل الاجتماعي')}</h3>
            </div>
            <div className="space-y-3">
              {/* LinkedIn */}
              <div>
                <label className="text-sm text-gray-600 block mb-1 flex items-center gap-1">
                  <Linkedin className="h-3 w-3 text-blue-700" /> LinkedIn
                </label>
                {editingSection === 'linkedin' ? (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={profileData.linkedin}
                      onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="https://linkedin.com/in/username"
                    />
                    <button onClick={() => handleSave('linkedin', profileData.linkedin)} className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm">
                      <Save className="h-3 w-3" />
                    </button>
                    <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">
                      {getText('Cancel', 'Annuler', 'إلغاء')}
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-800 text-sm truncate">{profileData.linkedin || getText('Not set', 'Non défini', 'غير محدد')}</p>
                    <button onClick={() => setEditingSection('linkedin')} className="text-gray-400 hover:text-blue-500 transition">
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Instagram */}
              <div>
                <label className="text-sm text-gray-600 block mb-1 flex items-center gap-1">
                  <Instagram className="h-3 w-3 text-pink-600" /> Instagram
                </label>
                {editingSection === 'instagram' ? (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={profileData.instagram}
                      onChange={(e) => setProfileData({ ...profileData, instagram: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="https://instagram.com/username"
                    />
                    <button onClick={() => handleSave('instagram', profileData.instagram)} className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm">
                      <Save className="h-3 w-3" />
                    </button>
                    <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">
                      {getText('Cancel', 'Annuler', 'إلغاء')}
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-800 text-sm truncate">{profileData.instagram || getText('Not set', 'Non défini', 'غير محدد')}</p>
                    <button onClick={() => setEditingSection('instagram')} className="text-gray-400 hover:text-blue-500 transition">
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Facebook */}
              <div>
                <label className="text-sm text-gray-600 block mb-1 flex items-center gap-1">
                  <Facebook className="h-3 w-3 text-blue-600" /> Facebook
                </label>
                {editingSection === 'facebook' ? (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={profileData.facebook}
                      onChange={(e) => setProfileData({ ...profileData, facebook: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="https://facebook.com/username"
                    />
                    <button onClick={() => handleSave('facebook', profileData.facebook)} className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm">
                      <Save className="h-3 w-3" />
                    </button>
                    <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">
                      {getText('Cancel', 'Annuler', 'إلغاء')}
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-800 text-sm truncate">{profileData.facebook || getText('Not set', 'Non défini', 'غير محدد')}</p>
                    <button onClick={() => setEditingSection('facebook')} className="text-gray-400 hover:text-blue-500 transition">
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Twitter/X */}
              <div>
                <label className="text-sm text-gray-600 block mb-1 flex items-center gap-1">
                  <Twitter className="h-3 w-3 text-blue-400" /> Twitter/X
                </label>
                {editingSection === 'twitter' ? (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={profileData.twitter}
                      onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="https://twitter.com/username"
                    />
                    <button onClick={() => handleSave('twitter', profileData.twitter)} className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm">
                      <Save className="h-3 w-3" />
                    </button>
                    <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">
                      {getText('Cancel', 'Annuler', 'إلغاء')}
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-800 text-sm truncate">{profileData.twitter || getText('Not set', 'Non défini', 'غير محدد')}</p>
                    <button onClick={() => setEditingSection('twitter')} className="text-gray-400 hover:text-blue-500 transition">
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/clients')}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-3 group"
          >
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-800">{getText('View All Clients', 'Voir tous les clients', 'عرض جميع العملاء')}</p>
              <p className="text-xs text-gray-500">{getText('Manage your client list', 'Gérer votre liste de clients', 'إدارة قائمة عملائك')}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition" />
          </button>
          
          <button 
            onClick={() => navigate('/messages')}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-3 group"
          >
            <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition">
              <MessageCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-800">{getText('Messages', 'Messages', 'الرسائل')}</p>
              <p className="text-xs text-gray-500">{getText('Chat with your clients', 'Discuter avec vos clients', 'الدردشة مع عملائك')}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition" />
          </button>
          
          <button 
            onClick={() => navigate('/clients')}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-3 group"
          >
            <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-800">{getText('Resources', 'Ressources', 'الموارد')}</p>
              <p className="text-xs text-gray-500">{getText('Training materials & guides', 'Matériel de formation et guides', 'مواد تدريبية وأدلة')}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition" />
          </button>
        </div>

        {/* Tip Box */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-800 text-sm">{getText('Profile Tips', 'Conseils de profil', 'نصائح الملف الشخصي')}</h4>
              <p className="text-xs text-blue-600 mt-1">
                {getText(
                  'Complete your profile and share media to help clients learn about your expertise. Add your bio, specialties, and contact information to build trust with potential clients.',
                  'Complétez votre profil et partagez des médias pour aider les clients à en savoir plus sur votre expertise. Ajoutez votre bio, vos spécialités et vos coordonnées pour établir la confiance avec les clients potentiels.',
                  'أكمل ملفك الشخصي وشارك الوسائط لمساعدة العملاء على التعرف على خبراتك. أضف سيرتك الذاتية وتخصصاتك ومعلومات الاتصال لبناء الثقة مع العملاء المحتملين.'
                )}
              </p>
            </div>
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

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        imageUrl={user?.profilePicture}
        name={user?.name}
      />
    </div>
  );
};

export default CoachProfile;