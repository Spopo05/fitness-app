import axios from 'axios';
import toast from 'react-hot-toast';
import i18n from '../i18n';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: false
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to get translated message
const getMessage = (key, defaultMsg) => {
  const t = i18n.t;
  return t(key) || defaultMsg;
};

api.interceptors.response.use(
  (response) => {
    // Handle success messages from backend
    const messageKey = response.data?.messageKey;
    const message = response.data?.message;
    
    if (messageKey) {
      toast.success(getMessage(messageKey, message));
    } else if (message) {
      toast.success(message);
    }
    
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    const errorKey = error.response?.data?.errorKey;
    
    if (errorKey) {
      toast.error(getMessage(errorKey, message));
    } else if (status === 401) {
      toast.error(getMessage('errors.sessionExpired', 'Session expired'));
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (status === 403) {
      toast.error(getMessage('errors.subscriptionRequired', 'Subscription required'));
    } else if (message) {
      toast.error(message);
    } else {
      toast.error(getMessage('errors.somethingWentWrong', 'Something went wrong'));
    }

    return Promise.reject(error);
  }
);

export default api;