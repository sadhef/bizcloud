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
  withCredentials: false, // Important for CORS
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
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection and ensure the backend server is running.');
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