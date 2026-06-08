import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Dumbbell, Apple, Activity, Heart, TrendingUp, Users, 
  MessageCircle, Calendar, Target, Zap, Shield, Star,
  ChevronRight, Play, CheckCircle, ArrowRight, Menu, X,
  Crown, Sparkles, Brain, Clock, Award, Flame, Gift,
  Globe, CalendarDays, Clock3, MapPin, Phone, Mail,
  Facebook, Instagram, Twitter, Youtube, Linkedin,
  UserCheck, Trophy, Coffee, Smile, Medal, Quote
} from 'lucide-react';

// Hero background image
const heroBgImage = "https://m.gettywallpapers.com/wp-content/uploads/2023/12/Chris-Bumstead-Desktop-Wallpaper.jpg";

// Location coordinates (Rabat, Morocco)
const LOCATION = {
  lat: 34.03564088173538,
  lng: -6.784870132275072,
  address: "Rabat, Morocco",
  name: "FitnessPro Headquarters"
};

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const isRTL = i18n.language === 'ar';
  const isFrench = i18n.language === 'fr';

  const getText = (en, fr, ar) => {
    if (isFrench) return fr;
    if (isRTL) return ar;
    return en;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setShowLanguageMenu(false);
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  const getCurrentLanguage = () => {
    switch (i18n.language) {
      case 'ar': return 'العربية';
      case 'fr': return 'Français';
      default: return 'English';
    }
  };

  const smoothScrollTo = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };

  const features = [
    { icon: Dumbbell, title: getText('Personalized Workouts', 'Entraînements personnalisés', 'تمارين مخصصة'), description: getText('AI-powered workout plans tailored to your goals', 'Plans d\'entraînement IA adaptés à vos objectifs', 'خطط تمارين بالذكاء الاصطناعي مصممة لأهدافك'), color: 'blue' },
    { icon: Apple, title: getText('Smart Nutrition', 'Nutrition intelligente', 'تغذية ذكية'), description: getText('Personalized meal plans and calorie tracking', 'Plans de repas personnalisés et suivi des calories', 'خطط وجبات مخصصة وتتبع السعرات'), color: 'green' },
    { icon: Brain, title: getText('AI Coach', 'Coach IA', 'مدرب ذكي'), description: getText('24/7 AI fitness assistant for guidance', 'Assistant fitness IA 24/7 pour vous guider', 'مساعد لياقة بالذكاء الاصطناعي على مدار الساعة'), color: 'purple' },
    { icon: Users, title: getText('Expert Coaches', 'Coach experts', 'مدربون خبراء'), description: getText('Connect with professional fitness coaches', 'Connectez-vous avec des coachs fitness professionnels', 'تواصل مع مدربين لياقة محترفين'), color: 'orange' },
    { icon: MessageCircle, title: getText('Direct Messaging', 'Messagerie directe', 'مراسلة مباشرة'), description: getText('Chat with your coach anytime', 'Discutez avec votre coach à tout moment', 'تحدث مع مدربك في أي وقت'), color: 'pink' },
    { icon: TrendingUp, title: getText('Progress Tracking', 'Suivi de progression', 'تتبع التقدم'), description: getText('Monitor your fitness journey with analytics', 'Suivez votre parcours fitness avec des analyses', 'تابع رحلتك اللياقية مع التحليلات'), color: 'emerald' },
  ];

  const coachTestimonials = [];

  const plans = [
    { 
      name: getText('Basic', 'Basique', 'أساسي'), 
      price: '49', 
      period: getText('month', 'mois', 'شهر'),
      features: [
        getText('Basic workouts', 'Entraînements basiques', 'تمارين أساسية'),
        getText('Basic diet plans', 'Plans alimentaires basiques', 'خطط غذائية أساسية'),
        getText('Email support', 'Support par email', 'دعم بالبريد الإلكتروني'),
        getText('Progress tracking', 'Suivi de progression', 'تتبع التقدم'),
      ],
      aiAccess: false,
      buttonColor: 'gray',
      popular: false,
      hasFreeTrial: true,
      trialDays: 7
    },
    { 
      name: getText('Pro', 'Pro', 'برو'), 
      price: '99', 
      period: getText('month', 'mois', 'شهر'),
      features: [
        getText('Advanced workouts', 'Entraînements avancés', 'تمارين متقدمة'),
        getText('Personalized diet plans', 'Plans alimentaires personnalisés', 'خطط غذائية مخصصة'),
        getText('Priority support', 'Support prioritaire', 'دعم ذو أولوية'),
        getText('Video coaching calls', 'Appels de coaching vidéo', 'مكالمات تدريب فيديو'),
        getText('Monthly reports', 'Rapports mensuels', 'تقارير شهرية'),
      ],
      aiAccess: false,
      buttonColor: 'blue',
      popular: false,
      hasFreeTrial: false,
      trialDays: 0
    },
    { 
      name: getText('Premium', 'Premium', 'بريميوم'), 
      price: '149', 
      period: getText('month', 'mois', 'شهر'),
      features: [
        getText('All Pro features', 'Toutes les fonctionnalités Pro', 'جميع ميزات Pro'),
        getText('1-on-1 coaching', 'Coaching individuel', 'تدريب فردي'),
        getText('Custom meal plans', 'Plans de repas personnalisés', 'خطط وجبات مخصصة'),
        getText('Weekly check-ins', 'Points hebdomadaires', 'متابعات أسبوعية'),
        getText('Unlimited messaging', 'Messagerie illimitée', 'مراسلة غير محدودة'),
        getText('AI Assistant access', 'Accès à l\'assistant IA', 'الوصول إلى المساعد الذكي'),
      ],
      aiAccess: true,
      buttonColor: 'yellow',
      popular: true,
      hasFreeTrial: false,
      trialDays: 0
    },
    { 
      name: getText('Elite', 'Élite', 'إيليت'), 
      price: '249', 
      period: getText('month', 'mois', 'شهر'),
      features: [
        getText('All Premium features', 'Toutes les fonctionnalités Premium', 'جميع ميزات Premium'),
        getText('Dedicated coach', 'Coach dédié', 'مدرب مخصص'),
        getText('In-person sessions', 'Sessions en personne', 'جلسات شخصية'),
        getText('Nutritionist consultation', 'Consultation nutritionniste', 'استشارة أخصائي تغذية'),
        getText('24/7 priority support', 'Support prioritaire 24/7', 'دعم ذو أولوية 24/7'),
        getText('Free merchandise', 'Marchandise gratuite', 'بضائع مجانية'),
        getText('VIP event access', 'Accès aux événements VIP', 'الوصول إلى فعاليات VIP'),
      ],
      aiAccess: true,
      buttonColor: 'purple',
      popular: false,
      hasFreeTrial: false,
      trialDays: 0
    },
  ];

  const stats = [
    { value: '50+', label: getText('Active Users', 'Utilisateurs actifs', 'مستخدم نشط'), icon: Users },
    { value: '10', label: getText('Expert Coaches', 'Coach experts', 'مدرب خبير'), icon: Award },
    { value: '100+', label: getText('Workouts Completed', 'Entraînements complétés', 'تمرين مكتمل'), icon: Dumbbell },
    { value: '95%', label: getText('Satisfaction Rate', 'Taux de satisfaction', 'معدل الرضا'), icon: Star },
  ];

  // Google Maps embed URL with the location
  const mapEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d${LOCATION.lat}!2d${LOCATION.lng}!3d${LOCATION.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDAyJzA4LjMiTiA2wrA0NycwNS41Ilc!5e0!3m2!1sen!2sma!4v1700000000000!5m2!1sen!2sma`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header/Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FitnessPro
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => smoothScrollTo('features')} className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                {getText('Features', 'Fonctionnalités', 'الميزات')}
              </button>
              <button onClick={() => smoothScrollTo('pricing')} className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                {getText('Pricing', 'Tarifs', 'الأسعار')}
              </button>
              <button onClick={() => smoothScrollTo('about')} className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                {getText('About', 'À propos', 'حول')}
              </button>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">{getCurrentLanguage()}</span>
                </button>
                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <button onClick={() => changeLanguage('en')} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">🇬🇧 English</button>
                    <button onClick={() => changeLanguage('fr')} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">🇫🇷 Français</button>
                    <button onClick={() => changeLanguage('ar')} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">🇸🇦 العربية</button>
                  </div>
                )}
              </div>
              <button onClick={() => navigate('/login')} className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                {getText('Login', 'Connexion', 'تسجيل الدخول')}
              </button>
              <button onClick={() => navigate('/register')} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg">
                {getText('Start Free Trial', 'Essai gratuit', 'ابدأ النسخة التجريبية')}
              </button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => smoothScrollTo('features')} className="block w-full text-left py-2 text-gray-600 hover:text-gray-900">
                {getText('Features', 'Fonctionnalités', 'الميزات')}
              </button>
              <button onClick={() => smoothScrollTo('pricing')} className="block w-full text-left py-2 text-gray-600 hover:text-gray-900">
                {getText('Pricing', 'Tarifs', 'الأسعار')}
              </button>
              <button onClick={() => smoothScrollTo('about')} className="block w-full text-left py-2 text-gray-600 hover:text-gray-900">
                {getText('About', 'À propos', 'حول')}
              </button>
              <div className="pt-2">
                <p className="text-xs text-gray-400 mb-2">{getText('Language', 'Langue', 'اللغة')}</p>
                <div className="flex gap-2">
                  <button onClick={() => changeLanguage('en')} className={`flex-1 px-3 py-1.5 rounded-lg text-sm ${i18n.language === 'en' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>🇬🇧 English</button>
                  <button onClick={() => changeLanguage('fr')} className={`flex-1 px-3 py-1.5 rounded-lg text-sm ${i18n.language === 'fr' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>🇫🇷 Français</button>
                  <button onClick={() => changeLanguage('ar')} className={`flex-1 px-3 py-1.5 rounded-lg text-sm ${i18n.language === 'ar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>🇸🇦 العربية</button>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <button onClick={() => navigate('/login')} className="w-full py-2 text-gray-600 hover:text-gray-900">
                  {getText('Login', 'Connexion', 'تسجيل الدخول')}
                </button>
                <button onClick={() => navigate('/register')} className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium">
                  {getText('Start Free Trial', 'Essai gratuit', 'ابدأ النسخة التجريبية')}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65)), url(${heroBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white uppercase tracking-wider mb-4">
            FEEL <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">GOOD</span>
          </h1>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white uppercase tracking-wider mb-6">
            WITH <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">US</span>
          </h1>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 backdrop-blur-sm rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-red-300 uppercase tracking-wide">{getText('AI-Powered Fitness', 'Fitness IA', 'لياقة بالذكاء الاصطناعي')}</span>
          </div>
          
          <p className="text-gray-200 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            {getText(
              'Transform your body and mind with our expert coaches and AI-powered fitness solutions.',
              'Transformez votre corps et votre esprit avec nos coachs experts et solutions fitness IA.',
              'حول جسمك وعقلك مع مدربينا الخبراء وحلول اللياقة بالذكاء الاصطناعي.'
            )}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2 text-lg uppercase tracking-wide"
            >
              {getText('BECOME A MEMBER', 'DEVENIR MEMBRE', 'كن عضواً')}
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/register?plan=basic&trial=7')}
              className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-lg"
            >
              <Gift className="h-5 w-5" />
              {getText('7-DAY FREE TRIAL', 'ESSAI GRATUIT 7 JOURS', 'نسخة تجريبية مجانية 7 أيام')}
            </button>
          </div>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{getText('No credit card required', 'Carte bancaire non requise', 'لا حاجة لبطاقة ائتمان')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{getText('Cancel anytime', 'Annulez à tout moment', 'ألغ في أي وقت')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{getText('7 days free', '7 jours gratuits', '7 أيام مجانية')}</span>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-4">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">{getText('Expert Coaching System', 'Système de Coaching Expert', 'نظام التدريب الخبير')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {getText('Your Personal Coach,', 'Votre Coach Personnel,', 'مدربك الشخصي،')}
            </h2>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {getText('Your Path to Success', 'Votre Chemin vers le Succès', 'طريقك إلى النجاح')}
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mt-4"></div>
          </div>

          {/* Main About Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {getText('Why Work With Our Coaches?', 'Pourquoi Travailler Avec Nos Coachs ?', 'لماذا العمل مع مدربينا؟')}
                  </h3>
                  <p className="text-gray-500 text-sm">{getText('Proven results, personalized approach', 'Résultats prouvés, approche personnalisée', 'نتائج مثبتة، نهج شخصي')}</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {getText(
                  'At FitnessPro, we believe that everyone deserves access to expert guidance. Our certified coaches are here to help you navigate your fitness journey, overcome obstacles, and celebrate your victories.',
                  'Chez FitnessPro, nous croyons que tout le monde mérite un accès à des conseils experts. Nos coachs certifiés sont là pour vous aider à naviguer dans votre parcours fitness, surmonter les obstacles et célébrer vos victoires.',
                  'في FitnessPro، نعتقد أن الجميع يستحق الوصول إلى إرشادات الخبراء. مدربونا المعتمدون هنا لمساعدتك في التنقل في رحلتك اللياقية، والتغلب على العقبات، والاحتفال بانتصاراتك.'
                )}
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {getText('1-on-1 Personalized Coaching', 'Coaching Personnalisé 1-sur-1', 'تدريب شخصي 1 ضد 1')}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {getText('Get a dedicated coach who understands your unique needs and goals.', 'Obtenez un coach dédié qui comprend vos besoins et objectifs uniques.', 'احصل على مدرب مخصص يفهم احتياجاتك وأهدافك الفريدة.')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {getText('Customized Workout & Nutrition Plans', 'Plans d\'Entraînement et Nutrition Personnalisés', 'خطط تمرين وتغذية مخصصة')}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {getText('No more generic programs. Every plan is tailored specifically for you.', 'Plus de programmes génériques. Chaque plan est adapté spécifiquement pour vous.', 'لا مزيد من البرامج العامة. كل خطة مصممة خصيصًا لك.')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {getText('24/7 Support & Accountability', 'Support et Responsabilité 24/7', 'دعم ومساءلة 24/7')}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {getText('Message your coach anytime. Stay motivated with regular check-ins.', 'Message à votre coach à tout moment. Restez motivé avec des points réguliers.', 'راسل مدربك في أي وقت. حافظ على تحفيزك مع المتابعات المنتظمة.')}
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md flex items-center gap-2"
              >
                {getText('Find Your Coach', 'Trouvez Votre Coach', 'ابحث عن مدربك')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://i.pinimg.com/736x/84/5c/83/845c83fd0802e55318f943c6caddd7af.jpg" 
                  alt="Personal Training" 
                  className="w-full h-[400px] object-cover opacity-90"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-red-600 p-4 rounded-xl hidden md:block shadow-xl">
                <Play className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-3 hidden lg:block">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Smile className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{getText('Success Rate', 'Taux de Réussite', 'معدل النجاح')}</p>
                    <p className="text-lg font-bold text-gray-900">95%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-center text-gray-900 mb-8">
              {getText('How Our Coaching System Works', 'Comment Fonctionne Notre Système de Coaching', 'كيف يعمل نظام التدريب لدينا')}
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {getText('Sign Up & Get Matched', 'Inscrivez-vous & Soyez Jumelé', 'سجل وتم匹配')}
                </h4>
                <p className="text-sm text-gray-500">
                  {getText('Tell us your goals and preferences', 'Dites-nous vos objectifs et préférences', 'أخبرنا بأهدافك وتفضيلاتك')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                  <span className="text-xl font-bold text-blue-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {getText('Meet Your Coach', 'Rencontrez Votre Coach', 'قابل مدربك')}
                </h4>
                <p className="text-sm text-gray-500">
                  {getText('Start with a personalized consultation', 'Commencez par une consultation personnalisée', 'ابدأ باستشارة مخصصة')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                  <span className="text-xl font-bold text-blue-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {getText('Achieve Your Goals', 'Atteignez Vos Objectifs', 'حقق أهدافك')}
                </h4>
                <p className="text-sm text-gray-500">
                  {getText('Follow your plan and track progress', 'Suivez votre plan et suivez les progrès', 'اتبع خطتك وتتبع التقدم')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide">
              {getText('Why Choose Us?', 'Pourquoi nous choisir ?', 'لماذا تختارنا؟')}
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mt-4"></div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              {getText(
                'Everything you need to achieve your fitness goals in one place',
                'Tout ce dont vous avez besoin pour atteindre vos objectifs fitness au même endroit',
                'كل ما تحتاجه لتحقيق أهدافك اللياقية في مكان واحد'
              )}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600',
                green: 'from-green-500 to-green-600',
                purple: 'from-purple-500 to-purple-600',
                orange: 'from-orange-500 to-orange-600',
                pink: 'from-pink-500 to-pink-600',
                emerald: 'from-emerald-500 to-emerald-600',
              };
              return (
                <div key={idx} className="bg-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all group">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[feature.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Free Trial Banner Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Gift className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {getText('Try Basic Plan Free for 7 Days!', 'Essayez le plan Basic gratuitement pendant 7 jours !', 'جرب الخطة الأساسية مجاناً لمدة 7 أيام!')}
            </h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              {getText(
                'Get started with our Basic plan completely free. No commitment, cancel anytime.',
                'Commencez avec notre plan Basic gratuitement. Sans engagement, annulez à tout moment.',
                'ابدأ مع خطتنا الأساسية مجاناً تماماً. بدون التزام، يمكنك الإلغاء في أي وقت.'
              )}
            </p>
            <button
              onClick={() => navigate('/register?plan=basic&trial=7')}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 mx-auto"
            >
              <Gift className="h-4 w-4" />
              {getText('Claim Your Free Trial', 'Profitez de votre essai gratuit', 'احصل على نسختك التجريبية المجانية')}
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-xs text-gray-400 mt-4">
              {getText('No credit card required • 7 days free • Cancel anytime', 'Pas de carte de crédit requise • 7 jours gratuits • Annulez à tout moment', 'لا حاجة لبطاقة ائتمان • 7 أيام مجانية • ألغ في أي وقت')}
            </p>
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full mb-4">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium text-purple-600">{getText('Premium Feature', 'Fonctionnalité Premium', 'ميزة بريميوم')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                {getText('24/7 AI Fitness Coach', 'Coach Fitness IA 24/7', 'مدرب لياقة بالذكاء الاصطناعي 24/7')}
              </h2>
              <p className="mt-4 text-gray-600">
                {getText(
                  'Get instant answers to your fitness questions, personalized workout recommendations, and nutrition advice anytime, anywhere.',
                  'Obtenez des réponses instantanées à vos questions fitness, des recommandations d\'entraînement personnalisées et des conseils nutritionnels à tout moment, n\'importe où.',
                  'احصل على إجابات فورية لأسئلتك اللياقية، وتوصيات تمارين مخصصة، ونصائح غذائية في أي وقت وفي أي مكان.'
                )}
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  {getText('Powered by Google Gemini AI', 'Propulsé par Google Gemini IA', 'مدعوم من Google Gemini AI')}
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  {getText('Personalized workout generation', 'Génération d\'entraînement personnalisé', 'توليد تمارين مخصصة')}
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  {getText('Smart meal planning', 'Planification de repas intelligente', 'تخطيط وجبات ذكي')}
                </li>
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
              >
                {getText('Try AI Assistant Free', 'Essayez l\'assistant IA gratuitement', 'جرب المساعد الذكي مجاناً')}
              </button>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6">
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">AI Coach</p>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-3 py-2 max-w-[80%]">
                      <p className="text-sm">👋 Hi! Ready to crush your fitness goals?</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-purple-600 text-white rounded-2xl px-3 py-2 max-w-[80%]">
                      <p className="text-sm">I want to lose weight and build muscle</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-3 py-2 max-w-[80%]">
                      <p className="text-sm">💪 Great! Let me create a personalized plan...</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <input type="text" placeholder="Ask me anything..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <button className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm">Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide">
              {getText('Membership Plans', 'Plans d\'abonnement', 'خطط العضوية')}
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mt-4"></div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              {getText(
                'Choose the plan that works for you. Basic plan includes 7-day free trial!',
                'Choisissez le plan qui vous convient. Le plan Basic comprend un essai gratuit de 7 jours !',
                'اختر الخطة التي تناسبك. الخطة الأساسية تشمل نسخة تجريبية مجانية لمدة 7 أيام!'
              )}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, idx) => {
              const isPopular = plan.popular;
              const buttonColor = {
                gray: 'bg-gray-600 hover:bg-gray-700',
                blue: 'bg-blue-600 hover:bg-blue-700',
                yellow: 'bg-yellow-500 hover:bg-yellow-600',
                purple: 'bg-purple-600 hover:bg-purple-700',
              };
              return (
                <div key={idx} className={`bg-white rounded-2xl shadow-lg border ${isPopular ? 'border-yellow-400 ring-4 ring-yellow-100' : 'border-gray-100'} overflow-hidden hover:shadow-xl transition-all relative`}>
                  {isPopular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-yellow-400 text-yellow-800 text-xs font-bold px-3 py-1 rounded-bl-lg">
                        {getText('Most Popular', 'Le plus populaire', 'الأكثر شيوعاً')}
                      </div>
                    </div>
                  )}
                  {plan.hasFreeTrial && (
                    <div className="absolute top-0 left-0">
                      <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg flex items-center gap-1">
                        <Gift className="h-3 w-3" />
                        {getText('7 Days Free', '7 Jours Gratuits', '7 أيام مجانية')}
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-500"> MAD/{plan.period}</span>
                    </div>
                    {plan.hasFreeTrial && (
                      <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                        <Gift className="h-3 w-3" />
                        {getText('First 7 days free!', '7 premiers jours gratuits !', 'أول 7 أيام مجانية!')}
                      </div>
                    )}
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      <li className="flex items-start gap-2 text-sm">
                        {plan.aiAccess ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-900 font-medium">{getText('✓ AI Assistant Access', '✓ Accès à l\'assistant IA', '✓ الوصول إلى المساعد الذكي')}</span>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-400">{getText('AI Assistant (Premium+)', 'Assistant IA (Premium+)', 'المساعد الذكي (بريميوم+)')}</span>
                          </>
                        )}
                      </li>
                    </ul>
                    <button
                      onClick={() => navigate(`/register?plan=${plan.name.toLowerCase()}&trial=${plan.hasFreeTrial ? 7 : 0}`)}
                      className={`mt-6 w-full py-2 ${buttonColor[plan.buttonColor]} text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
                    >
                      {plan.hasFreeTrial && <Gift className="h-4 w-4" />}
                      {plan.hasFreeTrial ? getText('Start Free Trial', 'Essai gratuit', 'ابدأ النسخة التجريبية') : getText('Subscribe Now', 'S\'abonner maintenant', 'اشترك الآن')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {getText('Ready to transform your fitness?', 'Prêt à transformer votre fitness ?', 'هل أنت مستعد لتحويل لياقتك؟')}
            </h2>
            <p className="mt-4 text-blue-100 max-w-xl mx-auto">
              {getText(
                'Join thousands of users who have already achieved their fitness goals with FitnessPro.',
                'Rejoignez des milliers d\'utilisateurs qui ont déjà atteint leurs objectifs fitness avec FitnessPro.',
                'انضم إلى الآلاف من المستخدمين الذين حققوا بالفعل أهدافهم اللياقية مع FitnessPro.'
              )}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register?plan=basic&trial=7')}
                className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Gift className="h-4 w-4" />
                {getText('Start 7-Day Free Trial', 'Essai gratuit de 7 jours', 'ابدأ النسخة التجريبية المجانية لمدة 7 أيام')}
              </button>
              <button
                onClick={() => smoothScrollTo('pricing')}
                className="px-8 py-3 border-2 border-white/30 rounded-xl font-semibold hover:border-white/50 transition-all"
              >
                {getText('View Plans', 'Voir les plans', 'عرض الخطط')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Map */}
      <footer className="py-12 px-4 border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Map Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              {getText('Find Us', 'Nous trouver', 'اعثر علينا')}
            </h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-64 md:h-80 w-full">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${LOCATION.lng - 0.05},${LOCATION.lat - 0.05},${LOCATION.lng + 0.05},${LOCATION.lat + 0.05}&layer=mapnik&marker=${LOCATION.lat},${LOCATION.lng}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="FitnessPro Location"
                  className="grayscale hover:grayscale-0 transition-all duration-300"
                ></iframe>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{LOCATION.name}</p>
                    <p className="text-sm text-gray-500">{LOCATION.address}</p>
                    <p className="text-xs text-gray-400">
                      {getText('Coordinates', 'Coordonnées', 'الإحداثيات')}: {LOCATION.lat}, {LOCATION.lng}
                    </p>
                  </div>
                  <a 
                    href={`https://www.google.com/maps?q=${LOCATION.lat},${LOCATION.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                  >
                    {getText('Get Directions', 'Obtenir l\'itinéraire', 'احصل على الاتجاهات')}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Dumbbell className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FitnessPro
              </span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700">{getText('Privacy', 'Confidentialité', 'الخصوصية')}</a>
              <a href="#" className="hover:text-gray-700">{getText('Terms', 'Conditions', 'الشروط')}</a>
              <a href="#" className="hover:text-gray-700">{getText('Contact', 'Contact', 'اتصل')}</a>
            </div>
            <p className="text-xs text-gray-400">
              © 2026 FitnessPro. {getText('All rights reserved.', 'Tous droits réservés.', 'جميع الحقوق محفوظة.')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;