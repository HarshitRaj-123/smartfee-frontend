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

// Create shared axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for HTTP-only cookies
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

    // Don't try to refresh tokens for auth endpoints to avoid infinite loops
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/forgot-password', '/auth/reset-password'];
    const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));

    // If error is 401 and we haven't tried to refresh token yet and it's not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
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

export default api; 