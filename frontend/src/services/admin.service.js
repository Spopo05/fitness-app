// frontend/src/services/admin.service.js
import api from './api';

class AdminService {
  // User Management
  async getAllUsers(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/users${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  }

  async getUserDetails(userId) {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  }

  async createUser(userData) {
    const response = await api.post('/admin/users', userData);
    return response.data;
  }

  async updateUser(userId, userData) {
    const response = await api.patch(`/admin/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  }

  async assignCoach(userId, coachId) {
    const response = await api.post(`/admin/users/${userId}/assign-coach`, { coachId });
    return response.data;
  }

  async removeCoach(userId) {
    const response = await api.post(`/admin/users/${userId}/remove-coach`);
    return response.data;
  }

  async getAllCoaches() {
    const response = await api.get('/admin/coaches');
    return response.data;
  }

  // Free Trial Management
  async getFreeTrialUsers(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/users/free-trial${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  }

  async getFreeTrialStats() {
    const response = await api.get('/admin/free-trial/stats');
    return response.data;
  }

  async extendFreeTrial(userId, days = 7) {
    const response = await api.post(`/admin/users/${userId}/extend-trial`, { days });
    return response.data;
  }

  // Subscription Management
  async getAllSubscriptions(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/subscriptions${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  }

  async getSubscriptionDetails(subscriptionId) {
    const response = await api.get(`/admin/subscriptions/${subscriptionId}`);
    return response.data;
  }

  async createSubscription(subscriptionData) {
    const response = await api.post('/admin/subscriptions', subscriptionData);
    return response.data;
  }

  async markSubscriptionAsPaid(subscriptionId, paymentReference) {
    const response = await api.post(`/admin/subscriptions/${subscriptionId}/mark-paid`, { paymentReference });
    return response.data;
  }

  async updateSubscription(subscriptionId, updateData) {
    const response = await api.patch(`/admin/subscriptions/${subscriptionId}`, updateData);
    return response.data;
  }

// frontend/src/services/admin.service.js

// ==================== CONTACT MANAGEMENT ====================

/**
 * Get all contact messages (Admin only)
 * @param {Object} params - { status, page, limit }
 */
async getAllContacts(params = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const response = await api.get(`/admin/contacts${queryParams ? `?${queryParams}` : ''}`);
  return response.data;
}

/**
 * Get contact message by ID (Admin only)
 * @param {string} contactId 
 */
async getContactById(contactId) {
  const response = await api.get(`/admin/contacts/${contactId}`);
  return response.data;
}

/**
 * Get contact statistics (Admin only)
 */
async getContactStats() {
  const response = await api.get('/admin/contacts/stats');
  return response.data;
}

/**
 * Update contact status (Admin only)
 * @param {string} contactId 
 * @param {Object} data - { status, adminNote }
 */
async updateContactStatus(contactId, data) {
  const response = await api.patch(`/admin/contacts/${contactId}/status`, data);
  return response.data;
}

/**
 * Delete contact message (Admin only)
 * @param {string} contactId 
 */
async deleteContact(contactId) {
  const response = await api.delete(`/admin/contacts/${contactId}`);
  return response.data;
}
// frontend/src/services/admin.service.js - Add this method

/**
 * Send reply email to customer (Admin only)
 * @param {string} contactId 
 * @param {Object} data - { replyMessage, subject }
 */
async sendReply(contactId, data) {
  const response = await api.post(`/admin/contacts/${contactId}/reply`, data);
  return response.data;
}
}

export default new AdminService();