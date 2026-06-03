import api from './api';

class NotificationService {
  constructor() {
    this.listeners = [];
    this.pollingInterval = null;
    this.lastCheckTime = localStorage.getItem('lastNotificationCheck') || Date.now();
  }

  // Fetch notifications from server
  async fetchNotifications(limit = 20) {
    try {
      const response = await api.get('/notifications', { params: { limit } });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [], unreadCount: 0 };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      this.notifyListeners();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all as read
  async markAllAsRead() {
    try {
      await api.patch('/notifications/read-all');
      this.notifyListeners();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      await api.delete(`/notifications/${notificationId}`);
      this.notifyListeners();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  // Delete all notifications
  async deleteAllNotifications() {
    try {
      await api.delete('/notifications');
      this.notifyListeners();
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      const { data } = await api.get('/notifications', { params: { limit: 1 } });
      return data.data.unreadCount;
    } catch (error) {
      return 0;
    }
  }

  // Start polling for new notifications (every 10 seconds)
  startPolling() {
    if (this.pollingInterval) return;
    
    this.pollingInterval = setInterval(async () => {
      const { unreadCount } = await this.fetchNotifications(1);
      const lastCount = localStorage.getItem('lastUnreadCount') || 0;
      
      if (unreadCount > lastCount) {
        this.notifyListeners();
      }
      
      localStorage.setItem('lastUnreadCount', unreadCount);
      localStorage.setItem('lastNotificationCheck', Date.now());
    }, 10000);
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Add listener for notification updates
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remove listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback());
  }
}

export default new NotificationService();