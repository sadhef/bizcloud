import axios from 'axios';
import { toast } from 'react-toastify';
import { clearStoredAuth } from './storage';

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://bizcloud-cnp2.vercel.app/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
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
      }
    }
    
    // Debug logging
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });

    // Handle network errors
    if (!error.response) {
      if (error.code === 'ERR_NETWORK') {
        toast.error('Network error: Unable to connect to server. Please check your connection.');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please try again.');
      } else {
        toast.error('Network error. Please check your connection and try again.');
      }
      return Promise.reject(error);
    }

    const { status } = error.response;

    // Handle authentication errors
    if (status === 401) {
      clearStoredAuth();
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle other errors
    const message = error.response?.data?.message || 'An error occurred';
    
    if (status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (status === 404) {
      toast.error('Resource not found');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;