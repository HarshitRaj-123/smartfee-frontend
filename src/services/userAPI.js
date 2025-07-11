import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

const userAPI = {
  // Get current user's detailed profile
  getUserProfile: async () => {
    return api.get('/users/profile');
  },

  // Update current user's profile
  updateUserProfile: async (profileData) => {
    return api.put('/users/profile', profileData);
  },

  // Get user-specific dashboard data
  getDashboardData: async () => {
    return api.get('/users/dashboard-data');
  },

  // Get user-specific notifications
  getUserNotifications: async () => {
    return api.get('/users/notifications');
  },

  // Get user-specific transactions (for students)
  getUserTransactions: async (params = {}) => {
    return api.get('/users/transactions', { params });
  },

  // Get user-specific fee information (for students)
  getUserFees: async () => {
    return api.get('/users/fees');
  },

  // Get assigned students (for accountants)
  getAssignedStudents: async () => {
    return api.get('/users/assigned-students');
  },

  // Upload profile picture
  uploadProfilePicture: async (formData) => {
    return api.post('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Get users by role (admins or accountants)
  getUsersByRole: async (role, params = {}) => {
    return api.get(`/users/by-role/${role}`, { params });
  },

  // Get login activities
  getLoginActivities: async (params = {}) => {
    return api.get('/users/login-activities', { params });
  },

  // Get all users (Super Admin only)
  getAllUsers: async (params = {}) => {
    return api.get('/users', { params });
  },

  // Update user status
  updateUserStatus: async (userId, isActive) => {
    return api.patch(`/users/${userId}/status`, { isActive });
  },

  // Create new user
  createUser: async (userData) => {
    return api.post('/users', userData);
  },

  // Update user
  updateUser: async (userId, userData) => {
    return api.put(`/users/${userId}`, userData);
  },

  // Delete user
  deleteUser: async (userId) => {
    return api.delete(`/users/${userId}`);
  }
};

export default userAPI; 