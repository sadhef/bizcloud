import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getStoredAuth, setStoredAuth, clearStoredAuth } from '../services/storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedAuth = getStoredAuth();
      
      if (storedAuth?.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedAuth.token}`;
        
        const data = await api.get('/auth/verify');
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      clearStoredAuth();
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await api.post('/auth/login', { email, password });
      const { user, token } = data;
      
      setStoredAuth({ user, token });
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      return { success: true, message: 'Registration successful! Please wait for admin approval.' };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    clearStoredAuth();
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  const updateUser = (userData) => {
    setCurrentUser(prev => ({ ...prev, ...userData }));
    const storedAuth = getStoredAuth();
    if (storedAuth) {
      setStoredAuth({ ...storedAuth, user: { ...storedAuth.user, ...userData } });
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};