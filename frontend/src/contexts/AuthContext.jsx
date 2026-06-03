import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to normalize user role
  const normalizeUser = (userData) => {
    if (!userData) return null;
    return {
      ...userData,
      role: userData.role || (userData.admin === true ? 'admin' : 'user')
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.data?.user || response.data.user;
      const normalizedUser = normalizeUser(userData);
      setUser(normalizedUser);
      // Also update localStorage with normalized user
      if (normalizedUser) {
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.data?.token || response.data.token;
      const userData = response.data.data?.user || response.data.user;
      if (!token || !userData) throw new Error('Invalid login response');

      const normalizedUser = normalizeUser(userData);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const token = response.data.data?.token || response.data.token;
      const userDataResponse = response.data.data?.user || response.data.user;
      if (!token || !userDataResponse) throw new Error('Invalid registration response');

      const normalizedUser = normalizeUser(userDataResponse);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const updateUser = (userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      const normalized = normalizeUser(updated);
      localStorage.setItem('user', JSON.stringify(normalized));
      return normalized;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};