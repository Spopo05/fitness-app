import { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Dumbbell, 
  ChevronDown, 
  Crown, 
  Shield, 
  Gift,
  Mail,
  CheckCircle,
  Activity,
  MessageCircle,
  Apple,
  Users,
  Star,
  Phone,
  MapPin,
  Clock,
  LayoutDashboard,
  Calendar,
  Target,
  Heart,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const isRTL = i18n.language === 'ar';
  const isFrench = i18n.language === 'fr';

  const getText = (en, fr, ar) => {
    if (isFrench) return fr;
    if (isRTL) return ar;
    return en;
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread messages count
  const { data: unreadCount, isLoading } = useQuery({
    queryKey: ['unreadMessages', user?._id],
    queryFn: async () => {
      try {
        const response = await api.get('/messages/unread/count');
        return response.data?.unreadCount || 0;
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
        return 0;
      }
    },
    enabled: !!user && user.role !== 'admin',
    refetchInterval: 30000,
    retry: 1,
    staleTime: 1000 * 60 * 5
  });

  const getRoleBadge = () => {
    if (user?.role === 'admin') {
      return { label: getText('Admin', 'Admin', 'مدير'), icon: Shield, color: 'from-red-500 to-red-600' };
    }
    if (user?.role === 'coach') {
      return { label: getText('Coach', 'Coach', 'مدرب'), icon: Crown, color: 'from-purple-500 to-purple-600' };
    }
    if (user?.subscription?.plan === 'elite') {
      return { label: getText('Elite', 'Élite', 'إيليت'), icon: Crown, color: 'from-yellow-500 to-amber-600' };
    }
    if (user?.subscription?.plan === 'premium') {
      return { label: getText('Premium', 'Premium', 'بريميوم'), icon: Star, color: 'from-purple-500 to-pink-600' };
    }
    if (user?.freeTrialEnds && new Date(user.freeTrialEnds) > new Date()) {
      return { label: getText('Free Trial', 'Essai gratuit', 'نسخة تجريبية'), icon: Gift, color: 'from-green-500 to-emerald-600' };
    }
    return { label: getText('User', 'Utilisateur', 'مستخدم'), icon: User, color: 'from-blue-500 to-blue-600' };
  };

  const roleBadge = getRoleBadge();
  const RoleIcon = roleBadge.icon;

  // Handle contact click - scroll to contact section or navigate
  const handleContactClick = () => {
    setDropdownOpen(false);
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/contact');
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100'
      }`}
    >
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-[70px]">
          {/* Left side - Logo & Menu Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Dumbbell className="h-4.5 w-4.5 text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  FitnessPro
                </span>
                <span className="text-[10px] text-gray-400 -mt-0.5">
                  {getText('Your Fitness Journey', 'Votre Parcours Fitness', 'رحلتك اللياقية')}
                </span>
              </div>
            </Link>
          </div>

          {/* Center - EMPTY */}
          <div className="hidden lg:flex items-center gap-1"></div>

          {/* Right side */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Notification Bell */}
            {user && <NotificationBell />}
            
            {/* User Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-all duration-200 group"
                >
                  <div className="relative">
                    <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md ring-2 ring-white group-hover:ring-2 group-hover:ring-blue-200 transition-all">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 lg:h-4.5 lg:w-4.5 text-white" />
                      )}
                    </div>
                    {unreadCount > 0 && !isLoading && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></div>
                    )}
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-800">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-gradient-to-r ${roleBadge.color} text-white`}>
                        <RoleIcon className="h-2.5 w-2.5" />
                        {roleBadge.label}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`hidden md:block h-4 w-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu - ONLY Contact Us and Logout */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                      {/* User Info Header */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md ring-4 ring-white">
                              {user?.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={user?.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-white" />
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white"></div>
                          </div>
                          <div className="flex-1">
                            <p className="text-base font-bold text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user?.email}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${roleBadge.color} text-white shadow-sm`}>
                            <RoleIcon className="h-3 w-3" />
                            {roleBadge.label}
                          </span>
                          {user?.emailVerified && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              <CheckCircle className="h-3 w-3" />
                              {getText('Verified', 'Vérifié', 'تم التحقق')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* ONLY TWO BUTTONS: Contact Us and Logout */}
                      <div className="py-2">
                        {/* CONTACT US BUTTON */}
                        <button
                          onClick={handleContactClick}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md group-hover:scale-105 transition">
                            <Phone className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-900">{getText('Contact Us', 'Contactez-nous', 'اتصل بنا')}</p>
                            <p className="text-xs text-gray-500">{getText('Get in touch with support', 'Contactez le support', 'تواصل مع الدعم')}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition" />
                        </button>
                      </div>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-100"></div>
                      
                      {/* LOGOUT BUTTON */}
                      <div className="p-2">
                        <button
                          onClick={() => {
                            logout();
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition">
                            <LogOut className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{getText('Sign Out', 'Déconnexion', 'تسجيل الخروج')}</p>
                            <p className="text-xs text-red-400">{getText('Logout from account', 'Se déconnecter', 'تسجيل الخروج من الحساب')}</p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Login/Signup buttons for non-logged in users */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {getText('Login', 'Connexion', 'تسجيل الدخول')}
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
                >
                  {getText('Sign Up', 'S\'inscrire', 'اشتراك')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation Bar - Simple */}
      {/* {user && (
        <>
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg z-40">
            <div className="flex items-center justify-around py-2 px-4">
              <button 
                onClick={handleContactClick}
                className="flex flex-col items-center gap-1 p-2 text-blue-600 transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span className="text-[10px] font-medium">{getText('Contact', 'Contact', 'اتصال')}</span>
              </button>
              <button 
                onClick={() => {
                  logout();
                }}
                className="flex flex-col items-center gap-1 p-2 text-red-500 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-[10px] font-medium">{getText('Logout', 'Déconnexion', 'تسجيل خروج')}</span>
              </button>
            </div>
          </div>
          <div className="lg:hidden pb-16"></div>
        </>
      )} */}
    </header>
  );
};

export default Header;