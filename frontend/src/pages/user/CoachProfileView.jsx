import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User, Mail, Phone, MapPin, Star, Award, Users, Target, 
  Briefcase, Calendar, MessageCircle, Linkedin, Instagram, 
  Facebook, Twitter, CheckCircle, TrendingUp, Heart,
  Quote, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const CoachProfileView = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {getText('No Coach Assigned', 'Aucun Coach Assigné', 'لا يوجد مدرب معين')}
        </h3>
        <p className="text-gray-500">
          {getText('A coach will be assigned to you soon.', 'Un coach vous sera bientôt assigné.', 'سيتم تعيين مدرب لك قريباً.')}
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {getText('Back to Dashboard', 'Retour au Tableau de bord', 'العودة إلى لوحة التحكم')}
        </button>
      </div>
    );
  }

  // Build stats array from real coach data
  const stats = [];
  if (coach.experience) {
    stats.push({ 
      label: getText('Years Experience', 'Années d\'expérience', 'سنوات الخبرة'), 
      value: coach.experience, 
      icon: Award, 
      color: 'amber' 
    });
  }
  if (coach.successRate) {
    stats.push({ 
      label: getText('Success Rate', 'Taux de réussite', 'معدل النجاح'), 
      value: coach.successRate, 
      icon: TrendingUp, 
      color: 'green' 
    });
  }

  // Parse specialties and certifications
  const specialties = coach.specialty ? coach.specialty.split(',').map(s => s.trim()) : [];
  const certifications = coach.certifications ? coach.certifications.split(',').map(c => c.trim()) : [];

  // Check for contact info
  const hasContactInfo = coach.phone || coach.location;

  return (
    <div className={`max-w-5xl mx-auto space-y-6 ${isRTL ? 'text-right' : ''}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className={`relative px-6 py-8 flex flex-col md:flex-row items-center gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-sm p-1 shadow-2xl ring-4 ring-white/20">
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500">
                {coach.profilePicture ? (
                  <img src={coach.profilePicture} alt={coach.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
            </div>
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white"></div>
          </div>
          
          {/* Info */}
          <div className={`text-center md:text-left flex-1 ${isRTL ? 'md:text-right' : ''}`}>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{coach.name}</h1>
            <p className="text-blue-100 text-sm mt-1">{coach.email}</p>
            <div className={`flex flex-wrap gap-2 mt-3 ${isRTL ? 'md:justify-start justify-center' : 'justify-center md:justify-start'}`}>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                {getText('Certified Personal Trainer', 'Coach Personnel Certifié', 'مدرب شخصي معتمد')}
              </span>
              {coach.createdAt && (
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                  {getText('Since', 'Depuis', 'منذ')} {formatDate(coach.createdAt)}
                </span>
              )}
            </div>
          </div>
          
          {/* Message Button */}
          <button
            onClick={handleSendMessage}
            className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-medium hover:bg-gray-100 transition shadow-lg flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            {getText('Send Message', 'Envoyer un message', 'إرسال رسالة')}
          </button>
        </div>
      </div>

      {/* Stats Grid - Only if coach has stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-2 bg-${stat.color}-50 rounded-xl`}>
                    <Icon className={`h-5 w-5 text-${stat.color}-500`} />
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Bio & Specialties */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          {coach.bio && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Quote className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-gray-800">
                  {getText('About Coach', 'À propos du coach', 'عن المدرب')}
                </h3>
              </div>
              <p className={`text-gray-600 leading-relaxed ${isRTL ? 'text-right' : ''}`}>{coach.bio}</p>
            </div>
          )}

          {/* Specialties */}
          {specialties.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Star className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-800">
                  {getText('Specialties & Expertise', 'Spécialités & Expertise', 'التخصصات والخبرات')}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty, index) => (
                  <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Award className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold text-gray-800">
                  {getText('Certifications', 'Certifications', 'الشهادات')}
                </h3>
              </div>
              <div className="space-y-3">
                {certifications.map((cert, index) => (
                  <div key={index} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!coach.bio && specialties.length === 0 && certifications.length === 0 && !coach.experience && !coach.successRate && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">
                {getText('Your coach hasn\'t added their profile details yet.', 'Votre coach n\'a pas encore ajouté les détails de son profil.', 'لم يضف مدربك تفاصيل ملفه الشخصي بعد.')}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {getText('Send them a message to learn more!', 'Envoyez-leur un message pour en savoir plus !', 'أرسل لهم رسالة لمعرفة المزيد!')}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Contact & Info */}
        <div className="space-y-6">
          {/* Contact Info */}
          {(hasContactInfo || coach.email) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className={`font-semibold text-gray-800 mb-4 ${isRTL ? 'text-right' : ''}`}>
                {getText('Contact Information', 'Coordonnées', 'معلومات الاتصال')}
              </h3>
              <div className="space-y-3">
                <div className={`flex items-center gap-3 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{coach.email}</span>
                </div>
                {coach.phone && (
                  <div className={`flex items-center gap-3 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{coach.phone}</span>
                  </div>
                )}
                {coach.location && (
                  <div className={`flex items-center gap-3 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{coach.location}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Links */}
          {(coach.linkedin || coach.instagram || coach.facebook || coach.twitter) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className={`font-semibold text-gray-800 mb-4 ${isRTL ? 'text-right' : ''}`}>
                {getText('Connect', 'Connecter', 'تواصل')}
              </h3>
              <div className="flex gap-4">
                {coach.linkedin && (
                  <a href={coach.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full hover:bg-blue-50 transition group">
                    <Linkedin className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
                  </a>
                )}
                {coach.instagram && (
                  <a href={coach.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full hover:bg-pink-50 transition group">
                    <Instagram className="h-5 w-5 text-gray-500 group-hover:text-pink-600" />
                  </a>
                )}
                {coach.facebook && (
                  <a href={coach.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full hover:bg-blue-50 transition group">
                    <Facebook className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
                  </a>
                )}
                {coach.twitter && (
                  <a href={coach.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full hover:bg-sky-50 transition group">
                    <Twitter className="h-5 w-5 text-gray-500 group-hover:text-sky-500" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Heart className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-gray-800">
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
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              {getText('Message Your Coach', 'Envoyer un message à votre coach', 'راسل مدربك')}
            </button>
          </div>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-500 italic">
          {getText(
            'Your coach is here to guide you every step of the way. Don\'t hesitate to reach out!',
            'Votre coach est là pour vous guider à chaque étape. N\'hésitez pas à le contacter !',
            'مدربك هنا لإرشادك في كل خطوة على الطريق. لا تتردد في التواصل!'
          )}
        </p>
      </div>
    </div>
  );
};

export default CoachProfileView;