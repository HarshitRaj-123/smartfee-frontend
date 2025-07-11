import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Variable to store auth context reference for token refresh
let authContextRef = null;

// Function to set auth context reference (called from AuthProvider)
export const setAuthContext = (authContext) => {
  authContextRef = authContext;
};

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

const authAPI = {
  // Login - no localStorage usage
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    // Don't store anything in localStorage - refreshToken comes via HTTP-only cookie
    return response;
  },

  // Register
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  // Logout - inform backend to invalidate refresh token
  logout: async () => {
    return api.post('/auth/logout');
  },

  // Refresh token - relies on HTTP-only cookie
  refreshToken: async () => {
    return api.post('/auth/refresh-token');
  },

  // Verify token
  verifyToken: async () => {
    return api.get('/auth/verify-token');
  },

  // Get user profile
  getProfile: async () => {
    return api.get('/auth/profile');
  },

  // Check role
  checkRole: async () => {
    return api.get('/auth/check-role');
  },

  // Update profile
  updateProfile: async (profileData) => {
    return api.put('/auth/profile', profileData);
  },

  // Change password
  changePassword: async (passwordData) => {
    return api.post('/auth/change-password', passwordData);
  },

  // Reset password request
  requestPasswordReset: async (email) => {
    return api.post('/auth/request-password-reset', { email });
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    return api.post('/auth/reset-password', { token, newPassword });
  },
};

export default authAPI; 