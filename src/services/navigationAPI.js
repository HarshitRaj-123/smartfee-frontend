import axios from 'axios';

// Use deployed backend URL in production, localhost in development
const API_URL = import.meta.env.PROD 
  ? 'https://smartfee-backend.vercel.app/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

// Variable to store auth context reference for token refresh
let authContextRef = null;

// Function to set auth context reference (called from AuthProvider)
export const setAuthContext = (authContext) => {
  authContextRef = authContext;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to attach accessToken from memory
api.interceptors.request.use(
  (config) => {
    // Get accessToken from auth context (in memory)
    if (authContextRef && authContextRef.accessToken) {
      config.headers.Authorization = `Bearer ${authContextRef.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token using auth context
        if (authContextRef && authContextRef.refreshToken) {
          const newAccessToken = await authContextRef.refreshToken();
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          // No auth context available, reject the request
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // If refresh fails, the auth context will handle logout
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const navigationAPI = {
  // Get sidebar navigation for current user role
  getSidebarNavigation: async () => {
    return api.get('/navigation/sidebar');
  },

  // Get all navigation items (super admin only)
  getAllNavigation: async () => {
    return api.get('/navigation/all');
  },
};

export default navigationAPI; 