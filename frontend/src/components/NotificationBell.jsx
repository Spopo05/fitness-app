import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Trash2, CheckCheck, X, MessageCircle, Apple, Dumbbell, CreditCard, Award, UserCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const NotificationBell = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();
  const isRTL = i18n.language === 'ar';

  // Fetch notifications
  const { data: notificationsData, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const response = await api.get('/notifications', { params: { limit: 20 } });
        return response.data.data;
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return { notifications: [], unreadCount: 0 };
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  // Delete all mutation
  const deleteAllMutation = useMutation({
    mutationFn: () => api.delete('/notifications'),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />;
      case 'diet_plan':
        return <Apple className="h-4 w-4 text-green-500 flex-shrink-0" />;
      case 'workout':
        return <Dumbbell className="h-4 w-4 text-orange-500 flex-shrink-0" />;
      case 'subscription':
        return <CreditCard className="h-4 w-4 text-purple-500 flex-shrink-0" />;
      case 'subscription_payment':
        return <CreditCard className="h-4 w-4 text-green-500 flex-shrink-0" />;
      case 'subscription_expiring':
        return <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
      case 'coach_assigned':
        return <UserCheck className="h-4 w-4 text-indigo-500 flex-shrink-0" />;
      case 'achievement':
        return <Award className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500 flex-shrink-0" />;
    }
  };

  const formatTime = (date) => {
    const notificationDate = new Date(date);
    const now = new Date();
    const diffMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return t('notifications.justNow', 'Just now');
    if (diffMinutes < 60) return `${diffMinutes} ${t('notifications.minutesAgo', 'minutes ago')}`;
    if (diffHours < 24) return `${diffHours} ${t('notifications.hoursAgo', 'hours ago')}`;
    if (diffDays === 1) return t('notifications.yesterday', 'Yesterday');
    return format(notificationDate, 'MMM dd');
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if not already
    if (!notification.read) {
      markAsReadMutation.mutate(notification._id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'message':
        const senderId = notification.data?.senderId;
        if (senderId) {
          navigate(`/messages?userId=${senderId}`);
        } else {
          navigate('/messages');
        }
        break;
      case 'diet_plan':
        navigate('/diet-plan');
        break;
      case 'workout':
        navigate('/workouts');
        break;
      case 'subscription':
      case 'subscription_payment':
      case 'subscription_expiring':
        navigate('/subscription');
        break;
      case 'coach_assigned':
        navigate('/profile');
        break;
      default:
        break;
    }
    
    setIsOpen(false);
  };

  const handleMarkAsRead = (e, id) => {
    e.stopPropagation();
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  const handleDeleteAll = () => {
    if (notifications.length > 0 && window.confirm(t('notifications.deleteAllConfirm', 'Delete all notifications?'))) {
      deleteAllMutation.mutate();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="font-semibold text-gray-900">
              {t('notifications.title', 'Notifications')}
            </h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-1 text-gray-500 hover:text-blue-600 rounded transition-colors"
                  title={t('notifications.markAllAsRead', 'Mark all as read')}
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="p-1 text-gray-500 hover:text-red-600 rounded transition-colors"
                  title={t('notifications.deleteAll', 'Delete all')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">{t('notifications.noNotifications', 'No notifications yet')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className={`flex items-start justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'} break-words ${isRTL ? 'text-right' : 'text-left'}`}>
                              {notification.title}
                            </p>
                            <p className={`text-xs text-gray-500 mt-1 break-words leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
                              {notification.message}
                            </p>
                            <p className={`text-xs text-gray-400 mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          <div className={`flex gap-1 flex-shrink-0 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                            {!notification.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(e, notification._id)}
                                className="p-1 text-gray-400 hover:text-blue-500 rounded transition-colors"
                                title={t('notifications.markAsRead', 'Mark as read')}
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(e, notification._id)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                              title={t('notifications.delete', 'Delete')}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;