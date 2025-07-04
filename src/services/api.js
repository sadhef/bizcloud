import axios from 'axios';
import { toast } from 'react-toastify';
import { clearStoredAuth } from './storage';

// Simple API URL detection
const getBaseURL = () => {
  if (window.location.hostname === 'bizclouds.vercel.app') {
    return 'https://bizservers.vercel.app/api';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

// Create axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const storedAuth = localStorage.getItem('biztras_auth');
    if (storedAuth) {
      try {
        const { token } = JSON.parse(storedAuth);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        clearStoredAuth();
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - SIMPLIFIED
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const message = data?.message || 'An error occurred';

    // Handle different status codes
    switch (status) {
      case 401:
        clearStoredAuth();
        delete api.defaults.headers.common['Authorization'];
        
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          toast.error('Session expired. Please log in again.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
        break;

      case 500:
        toast.error('Server error. Please try again later.');
        break;

      default:
        toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Health check method
api.healthCheck = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
};

export default api;