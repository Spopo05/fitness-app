import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  Headphones,
  Globe,
  Shield,
  Heart,
  Star,
  User,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Contact = () => {
  const { i18n } = useTranslation();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const isRTL = i18n.language === 'ar';
  const isFrench = i18n.language === 'fr';

  const getText = (en, fr, ar) => {
    if (isFrench) return fr;
    if (isRTL) return ar;
    return en;
  };

  // Check if user has access (User or Coach only, not Admin)
  useEffect(() => {
    if (authUser && authUser.role === 'admin') {
      navigate('/admin/dashboard');
      toast.error(getText(
        'Admins cannot access this page',
        'Les administrateurs ne peuvent pas accéder à cette page',
        'لا يمكن للمشرفين الوصول إلى هذه الصفحة'
      ));
    }
  }, [authUser, navigate]);

  // If not logged in, redirect to login
  useEffect(() => {
    if (!authUser) {
      navigate('/login');
    }
  }, [authUser, navigate]);

  // Pre-fill form with user data
  useEffect(() => {
    if (authUser) {
      setFormData(prev => ({
        ...prev,
        name: authUser.name || '',
        email: authUser.email || ''
      }));
    }
  }, [authUser]);

  // Contact form submission mutation - FIXED to use correct API endpoint
  const submitContactMutation = useMutation({
    mutationFn: async (data) => {
      // The API base URL is already set to http://localhost:5000/api
      // So we just need to use the relative path
      const response = await api.post('/contact/submit', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success(getText(
        'Message sent successfully! We will get back to you soon.',
        'Message envoyé avec succès ! Nous vous répondrons bientôt.',
        'تم إرسال الرسالة بنجاح! سوف نرد عليك قريباً.'
      ));
      setSubmitted(true);
      setFormData(prev => ({ ...prev, subject: '', message: '' }));
      setTimeout(() => setSubmitted(false), 5000);
    },
    onError: (error) => {
      console.error('Contact submission error:', error);
      const errorMessage = error.response?.data?.message || getText(
        'Failed to send message. Please try again.',
        'Échec de l\'envoi du message. Veuillez réessayer.',
        'فشل إرسال الرسالة. الرجاء المحاولة مرة أخرى.'
      );
      toast.error(errorMessage);
    }
  });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.message.trim()) {
      newErrors.message = getText('Message is required', 'Message requis', 'الرسالة مطلوبة');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        userId: authUser?._id,
        userRole: authUser?.role
      };
      console.log('Submitting contact form:', submitData);
      submitContactMutation.mutate(submitData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Show loading or return null while checking
  if (!authUser || authUser.role === 'admin') {
    return null;
  }

  const contactInfo = [
    {
      icon: Phone,
      title: getText('Phone', 'Téléphone', 'الهاتف'),
      details: getText('+212 5XX XXX XXX', '+212 5XX XXX XXX', '+212 5XX XXX XXX'),
      sub: getText('Mon-Fri, 9am - 6pm', 'Lun-Ven, 9h - 18h', 'الإثنين-الجمعة، 9ص - 6م'),
      color: 'blue'
    },
    {
      icon: Mail,
      title: getText('Email', 'Email', 'البريد الإلكتروني'),
      details: 'support@fitnesspro.com',
      sub: getText('24/7 Support', 'Support 24/7', 'دعم 24/7'),
      color: 'purple'
    },
    {
      icon: MapPin,
      title: getText('Address', 'Adresse', 'العنوان'),
      details: getText('123 Fitness Street, Casablanca, Morocco', '123 Rue Fitness, Casablanca, Maroc', 'شارع اللياقة 123، الدار البيضاء، المغرب'),
      sub: getText('Get directions', 'Obtenir l\'itinéraire', 'احصل على الاتجاهات'),
      color: 'green'
    },
    {
      icon: Clock,
      title: getText('Working Hours', 'Heures d\'ouverture', 'ساعات العمل'),
      details: getText('Monday - Friday: 9am - 9pm', 'Lundi - Vendredi: 9h - 21h', 'الإثنين - الجمعة: 9ص - 9م'),
      sub: getText('Saturday - Sunday: 10am - 6pm', 'Samedi - Dimanche: 10h - 18h', 'السبت - الأحد: 10ص - 6م'),
      color: 'orange'
    }
  ];

  const socialLinks = [
    { icon: Facebook, name: 'Facebook', url: 'https://facebook.com', color: 'bg-[#1877f2]' },
    { icon: Twitter, name: 'Twitter', url: 'https://twitter.com', color: 'bg-[#1da1f2]' },
    { icon: Instagram, name: 'Instagram', url: 'https://instagram.com', color: 'bg-gradient-to-r from-[#833ab4] to-[#fd1d1d]' },
    { icon: Linkedin, name: 'LinkedIn', url: 'https://linkedin.com', color: 'bg-[#0a66c2]' },
    { icon: Youtube, name: 'YouTube', url: 'https://youtube.com', color: 'bg-[#ff0000]' }
  ];

  const faqs = [
    {
      question: getText('How do I reset my password?', 'Comment réinitialiser mon mot de passe ?', 'كيف يمكنني إعادة تعيين كلمة المرور الخاصة بي؟'),
      answer: getText('Click on "Forgot Password" on the login page and follow the instructions sent to your email.', 'Cliquez sur "Mot de passe oublié" sur la page de connexion et suivez les instructions envoyées à votre email.', 'انقر على "نسيت كلمة المرور" في صفحة تسجيل الدخول واتبع التعليمات المرسلة إلى بريدك الإلكتروني.')
    },
    {
      question: getText('How can I upgrade my subscription?', 'Comment puis-je améliorer mon abonnement ?', 'كيف يمكنني ترقية اشتراكي؟'),
      answer: getText('Go to Settings > Subscription to view available plans and upgrade instantly.', 'Allez dans Paramètres > Abonnement pour voir les plans disponibles et passer à un niveau supérieur instantanément.', 'انتقل إلى الإعدادات > الاشتراك لعرض الخطط المتاحة والترقية فوراً.')
    },
    {
      question: getText('How do I contact my coach?', 'Comment contacter mon coach ?', 'كيف يمكنني الاتصال بمدربي؟'),
      answer: getText('Use the messaging feature in the app to directly chat with your assigned coach.', 'Utilisez la fonction de messagerie dans l\'application pour discuter directement avec votre coach assigné.', 'استخدم ميزة المراسلة في التطبيق للدردشة مباشرة مع مدربك المعين.')
    },
    {
      question: getText('What payment methods do you accept?', 'Quels modes de paiement acceptez-vous ?', 'ما هي طرق الدفع التي تقبلونها؟'),
      answer: getText('We accept credit cards, PayPal, and bank transfers. All payments are secure and encrypted.', 'Nous acceptons les cartes de crédit, PayPal et les virements bancaires. Tous les paiements sont sécurisés et cryptés.', 'نقبل بطاقات الائتمان و PayPal والتحويلات المصرفية. جميع المدفوعات آمنة ومشفرة.')
    }
  ];

  const getUserRoleDisplay = () => {
    if (authUser?.role === 'coach') {
      return getText('Coach', 'Coach', 'مدرب');
    }
    return getText('Member', 'Membre', 'عضو');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Role Badge */}
        <div className="mb-6 flex justify-end">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
            <User className="h-4 w-4" />
            <span>{getUserRoleDisplay()} {getText('Support', 'Support', 'الدعم')}</span>
          </div>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {getText('Contact Us', 'Contactez-nous', 'اتصل بنا')}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            {getText(
              'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
              'Des questions ? Nous aimerions avoir de vos nouvelles. Envoyez-nous un message et nous vous répondrons dès que possible.',
              'لديك أسئلة؟ نود أن نسمع منك. أرسل لنا رسالة وسنرد في أقرب وقت ممكن.'
            )}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-4"
          >
            {contactInfo.map((info, idx) => {
              const Icon = info.icon;
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600',
                purple: 'bg-purple-50 text-purple-600',
                green: 'bg-green-50 text-green-600',
                orange: 'bg-orange-50 text-orange-600'
              };
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${colorClasses[info.color]} group-hover:scale-110 transition`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{info.title}</h3>
                      <p className="text-gray-800 font-medium mt-1">{info.details}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{info.sub}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {/* Social Links */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                {getText('Follow Us', 'Suivez-nous', 'تابعنا')}
              </h3>
              <div className="flex gap-3">
                {socialLinks.map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-xl ${social.color} flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-md`}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">{getText('Trust & Safety', 'Confiance et sécurité', 'الثقة والأمان')}</h3>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <Heart className="h-6 w-6 text-red-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">{getText('24/7 Support', 'Support 24/7', 'دعم 24/7')}</p>
                </div>
                <div className="text-center">
                  <Star className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">{getText('4.9 Rating', 'Note 4.9', 'تقييم 4.9')}</p>
                </div>
                <div className="text-center">
                  <Headphones className="h-6 w-6 text-green-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">{getText('Fast Response', 'Réponse rapide', 'رد سريع')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-2xl font-bold text-gray-900">{getText('Send us a Message', 'Envoyez-nous un message', 'أرسل لنا رسالة')}</h2>
                <p className="text-gray-500 mt-1">{getText('Fill out the form below and we\'ll get back to you shortly.', 'Remplissez le formulaire ci-dessous et nous vous répondrons sous peu.', 'املأ النموذج أدناه وسنرد عليك قريباً.')}</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('Your Name', 'Votre Nom', 'اسمك')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed"
                        readOnly
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('Your Email', 'Votre Email', 'بريدك الإلكتروني')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed"
                        readOnly
                        disabled
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getText('Subject', 'Sujet', 'الموضوع')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MessageCircle className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={getText('How can we help?', 'Comment pouvons-nous vous aider ?', 'كيف يمكننا مساعدتك؟')}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getText('Message', 'Message', 'الرسالة')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-2.5 border ${errors.message ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
                    placeholder={getText(
                      'Please describe your question or concern in detail...',
                      'Veuillez décrire votre question ou préoccupation en détail...',
                      'يرجى وصف سؤالك أو استفسارك بالتفصيل...'
                    )}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.message}
                    </p>
                  )}
                </div>
                
                {submitted && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-700">
                      {getText(
                        'Thank you for your message! We will get back to you soon.',
                        'Merci pour votre message ! Nous vous répondrons bientôt.',
                        'شكراً لرسالتك! سوف نرد عليك قريباً.'
                      )}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitContactMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-50"
                  >
                    {submitContactMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {getText('Send Message', 'Envoyer', 'إرسال')}
                  </button>
                </div>
              </form>
            </div>
            
            {/* FAQ Section */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Headphones className="h-5 w-5 text-blue-600" />
                {getText('Frequently Asked Questions', 'Questions fréquentes', 'الأسئلة الشائعة')}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {faqs.map((faq, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="font-semibold text-gray-900">{getText('Find Us', 'Nous trouver', 'اعثر علينا')}</h3>
            </div>
            <div className="h-64 bg-gray-200 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106068.79104740939!2d-7.672453147433156!3d33.57323866787424!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7cd4778aa113b%3A0xb06c1d84f310fd3!2sCasablanca%2C%20Morocco!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="FitnessPro Location"
              ></iframe>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;