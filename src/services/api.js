import axios from 'axios';
import { toast } from 'react-toastify';
import { clearStoredAuth } from './storage';

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
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
        console.error('Error parsing auth token:', error);
        clearStoredAuth();
      }
    }
    
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - Success`);
    return response.data;
  },
  (error) => {
    console.error(`[API] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Failed:`, error.response?.status || 'Network Error');

    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        toast.error('Request timeout. Please try again.');
      } else {
        toast.error('Network error. Please check your connection.');
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const errorMessage = data?.message || error.message || 'An error occurred';

    // Handle different HTTP status codes
    switch (status) {
      case 401:
        console.log('[API] 401 Unauthorized - clearing auth data');
        clearStoredAuth();
        delete api.defaults.headers.common['Authorization'];
        
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          toast.error('Session expired. Please log in again.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
        break;

      case 403:
        toast.error('You do not have permission to perform this action');
        break;

      case 404:
        toast.error('Resource not found');
        break;

      case 408:
        toast.error('Request timeout. Please try again.');
        break;

      case 422:
        toast.error(errorMessage || 'Invalid data provided');
        break;

      case 429:
        toast.error('Too many requests. Please wait and try again.');
        break;

      case 500:
        toast.error('Internal server error. Please try again later.');
        break;

      case 502:
      case 503:
      case 504:
        toast.error('Server temporarily unavailable. Please try again later.');
        break;

      default:
        toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// Health check method
api.healthCheck = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    console.log('[API] Health check passed');
    return true;
  } catch (error) {
    console.error('[API] Health check failed:', error);
    return false;
  }
};

// Handle online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[API] Connection restored');
    toast.success('Connection restored', { autoClose: 2000 });
  });

  window.addEventListener('offline', () => {
    console.log('[API] Connection lost');
    toast.warning('You are currently offline', { autoClose: 3000 });
  });
}

export default api;