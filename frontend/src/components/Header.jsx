import { useState } from 'react';
import { Menu, Bell, User, LogOut, Settings, Dumbbell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell'; // Add this import

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const handleSettingsClick = () => {
    setDropdownOpen(false);
    navigate('/settings');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Logo */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center shadow-md">
                <Dumbbell className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                FitnessPro
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            
            {/* Notification Bell - Replace the old Bell button with this */}
            <NotificationBell />
            
            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-3.5 w-3.5 text-white" />
                  )}
                </div>
                <span className="hidden md:inline-block text-sm font-medium text-gray-700">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
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
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={handleSettingsClick}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Settings
                    </button>
                    
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;