import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Dumbbell, Apple, Activity, Heart, TrendingUp, Users, 
  MessageCircle, Calendar, Target, Zap, Shield, Star,
  ChevronRight, Play, CheckCircle, ArrowRight, Menu, X,
  Crown, Sparkles, Brain, Clock, Award, Flame
} from 'lucide-react';

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  const features = [
    { icon: Dumbbell, title: getText('Personalized Workouts', 'Entraînements personnalisés', 'تمارين مخصصة'), description: getText('AI-powered workout plans tailored to your goals', 'Plans d\'entraînement IA adaptés à vos objectifs', 'خطط تمارين بالذكاء الاصطناعي مصممة لأهدافك'), color: 'blue' },
    { icon: Apple, title: getText('Smart Nutrition', 'Nutrition intelligente', 'تغذية ذكية'), description: getText('Personalized meal plans and calorie tracking', 'Plans de repas personnalisés et suivi des calories', 'خطط وجبات مخصصة وتتبع السعرات'), color: 'green' },
    { icon: Brain, title: getText('AI Coach', 'Coach IA', 'مدرب ذكي'), description: getText('24/7 AI fitness assistant for guidance', 'Assistant fitness IA 24/7 pour vous guider', 'مساعد لياقة بالذكاء الاصطناعي على مدار الساعة'), color: 'purple' },
    { icon: Users, title: getText('Expert Coaches', 'Coach experts', 'مدربون خبراء'), description: getText('Connect with professional fitness coaches', 'Connectez-vous avec des coachs fitness professionnels', 'تواصل مع مدربين لياقة محترفين'), color: 'orange' },
    { icon: MessageCircle, title: getText('Direct Messaging', 'Messagerie directe', 'مراسلة مباشرة'), description: getText('Chat with your coach anytime', 'Discutez avec votre coach à tout moment', 'تحدث مع مدربك في أي وقت'), color: 'pink' },
    { icon: TrendingUp, title: getText('Progress Tracking', 'Suivi de progression', 'تتبع التقدم'), description: getText('Monitor your fitness journey with analytics', 'Suivez votre parcours fitness avec des analyses', 'تابع رحلتك اللياقية مع التحليلات'), color: 'emerald' },
  ];

  const plans = [
    { 
      name: getText('Basic', 'Basique', 'أساسي'), 
      price: '49', 
      period: getText('month', 'mois', 'شهر'),
      features: [
        getText('Basic workouts', 'Entraînements basiques', 'تمارين أساسية'),
        getText('Basic diet plans', 'Plas alimentaires basiques', 'خطط غذائية أساسية'),
        getText('Email support', 'Support par email', 'دعم بالبريد الإلكتروني'),
        getText('Progress tracking', 'Suivi de progression', 'تتبع التقدم'),
      ],
      aiAccess: false,
      buttonColor: 'gray',
      popular: false
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
      popular: false
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
      popular: true
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
      popular: false
    },
  ];

  const stats = [
    { value: '50K+', label: getText('Active Users', 'Utilisateurs actifs', 'مستخدم نشط'), icon: Users },
    { value: '100+', label: getText('Expert Coaches', 'Coach experts', 'مدرب خبير'), icon: Award },
    { value: '10K+', label: getText('Workouts Completed', 'Entraînements complétés', 'تمرين مكتمل'), icon: Dumbbell },
    { value: '95%', label: getText('Satisfaction Rate', 'Taux de satisfaction', 'معدل الرضا'), icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header/Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FitnessPro
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">{getText('Features', 'Fonctionnalités', 'الميزات')}</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">{getText('Pricing', 'Tarifs', 'الأسعار')}</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">{getText('About', 'À propos', 'حول')}</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {getText('Login', 'Connexion', 'تسجيل الدخول')}
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                {getText('Sign Up Free', 'S\'inscrire gratuitement', 'اشتر مجاناً')}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-600 hover:text-gray-900">{getText('Features', 'Fonctionnalités', 'الميزات')}</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-600 hover:text-gray-900">{getText('Pricing', 'Tarifs', 'الأسعار')}</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-600 hover:text-gray-900">{getText('About', 'À propos', 'حول')}</a>
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <button onClick={() => navigate('/login')} className="w-full py-2 text-gray-600 hover:text-gray-900">{getText('Login', 'Connexion', 'تسجيل الدخول')}</button>
                <button onClick={() => navigate('/register')} className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium">{getText('Sign Up Free', 'S\'inscrire gratuitement', 'اشتر مجاناً')}</button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 md:pt-40 pb-12 sm:pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-4">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-blue-600">{getText('AI-Powered Fitness', 'Fitness IA', 'لياقة بالذكاء الاصطناعي')}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {getText('Your fastest path', 'Votre chemin le plus rapide', 'أسرع طريق لك')}
                </span>
                <br />
                <span>{getText('to fitness', 'vers la forme physique', 'للياقة البدنية')}</span>
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-lg">
                {getText(
                  'AI-powered personalized workouts, nutrition plans, and 1-on-1 coaching to help you achieve your fitness goals faster.',
                  'Entraînements personnalisés par IA, plans nutritionnels et coaching individuel pour vous aider à atteindre vos objectifs fitness plus rapidement.',
                  'تمارين مخصصة بالذكاء الاصطناعي، خطط غذائية، وتدريب فردي لمساعدتك في تحقيق أهدافك اللياقية بشكل أسرع.'
                )}
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {getText('Start Free Trial', 'Essai gratuit', 'ابدأ النسخة التجريبية المجانية')}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 sm:px-8 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:border-gray-400 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {getText('See How It Works', 'Voir comment ça marche', 'شاهد كيف يعمل')}
                </button>
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{getText('No credit card required', 'Carte bancaire non requise', 'لا حاجة لبطاقة ائتمان')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{getText('Cancel anytime', 'Annulez à tout moment', 'ألغ في أي وقت')}</span>
                </div>
              </div>
            </div>

            {/* Right Content - Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              {getText('Everything you need to succeed', 'Tout ce dont vous avez besoin pour réussir', 'كل ما تحتاجه للنجاح')}
            </h2>
            <p className="mt-3 sm:mt-4 text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              {getText(
                'Powerful features that work together to help you achieve your fitness goals',
                'Des fonctionnalités puissantes qui travaillent ensemble pour vous aider à atteindre vos objectifs fitness',
                'ميزات قوية تعمل معاً لمساعدتك في تحقيق أهدافك اللياقية'
              )}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                <div key={idx} className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[feature.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full mb-4">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium text-purple-600">{getText('Premium Feature', 'Fonctionnalité Premium', 'ميزة بريميوم')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {getText('24/7 AI Fitness Coach', 'Coach Fitness IA 24/7', 'مدرب لياقة بالذكاء الاصطناعي 24/7')}
              </h2>
              <p className="mt-3 sm:mt-4 text-gray-600">
                {getText(
                  'Get instant answers to your fitness questions, personalized workout recommendations, and nutrition advice anytime, anywhere.',
                  'Obtenez des réponses instantanées à vos questions fitness, des recommandations d\'entraînement personnalisées et des conseils nutritionnels à tout moment, n\'importe où.',
                  'احصل على إجابات فورية لأسئلتك اللياقية، وتوصيات تمارين مخصصة، ونصائح غذائية في أي وقت وفي أي مكان.'
                )}
              </p>
              <ul className="mt-4 sm:mt-6 space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {getText('Powered by Google Gemini AI', 'Propulsé par Google Gemini IA', 'مدعوم من Google Gemini AI')}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {getText('Personalized workout generation', 'Génération d\'entraînement personnalisé', 'توليد تمارين مخصصة')}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {getText('Smart meal planning', 'Planification de repas intelligente', 'تخطيط وجبات ذكي')}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {getText('Progress predictions', 'Prédictions de progression', 'توقعات التقدم')}
                </li>
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="mt-6 sm:mt-8 px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
              >
                {getText('Try AI Assistant Free', 'Essayez l\'assistant IA gratuitement', 'جرب المساعد الذكي مجاناً')}
              </button>
            </div>
            <div className="order-1 md:order-2">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 sm:p-8">
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
                        <p className="text-sm">💪 Great! Let me create a personalized plan for you...</p>
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
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              {getText('Simple, transparent pricing', 'Tarifs simples et transparents', 'أسعار بسيطة وشفافة')}
            </h2>
            <p className="mt-3 sm:mt-4 text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              {getText(
                'Choose the plan that works for you. All plans include a 14-day free trial.',
                'Choisissez le plan qui vous convient. Tous les plans incluent un essai gratuit de 14 jours.',
                'اختر الخطة التي تناسبك. جميع الخطط تشمل نسخة تجريبية مجانية لمدة 14 يوماً.'
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
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-500"> MAD/{plan.period}</span>
                    </div>
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
                      onClick={() => navigate('/register')}
                      className={`mt-6 w-full py-2 ${buttonColor[plan.buttonColor]} text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg`}
                    >
                      {getText('Start Free Trial', 'Essai gratuit', 'ابدأ النسخة التجريبية')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {getText('Ready to transform your fitness?', 'Prêt à transformer votre fitness ?', 'هل أنت مستعد لتحويل لياقتك؟')}
            </h2>
            <p className="mt-3 sm:mt-4 text-blue-100 max-w-xl mx-auto text-sm sm:text-base">
              {getText(
                'Join thousands of users who have already achieved their fitness goals with FitAI.',
                'Rejoignez des milliers d\'utilisateurs qui ont déjà atteint leurs objectifs fitness avec FitAI.',
                'انضم إلى الآلاف من المستخدمين الذين حققوا بالفعل أهدافهم اللياقية مع FitAI.'
              )}
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="px-6 sm:px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg"
              >
                {getText('Get Started Free', 'Commencer gratuitement', 'ابدأ مجاناً')}
              </button>
              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 sm:px-8 py-3 border-2 border-white/30 rounded-xl font-semibold hover:border-white/50 transition-all"
              >
                {getText('View Plans', 'Voir les plans', 'عرض الخطط')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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