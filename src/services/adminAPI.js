import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = 'https://smartfee-backend.vercel.app/api';

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

const adminAPI = {
  // Get dashboard statistics
  getDashboardStats: async (params = {}) => {
    return api.get('/admin/dashboard/stats', { params });
  },

  // Get revenue trends data
  getRevenueTrends: async (params = {}) => {
    return api.get('/admin/dashboard/revenue-trends', { params });
  },

  // ========== STUDENTS MANAGEMENT ==========
  
  // Get all students with filters and pagination
  getStudents: async (params = {}) => {
    return api.get('/admin/students', { params });
  },

  // Get single student details
  getStudentById: async (id) => {
    return api.get(`/admin/students/${id}`);
  },

  // Update student information
  updateStudent: async (id, data) => {
    return api.put(`/admin/students/${id}`, data);
  },

  // Block/Unblock/Hold student
  updateStudentStatus: async (id, action, reason = '') => {
    return api.patch(`/admin/students/${id}/status`, { action, reason });
  },

  // Delete student
  deleteStudent: async (id) => {
    return api.delete(`/admin/students/${id}`);
  },

  // Get students statistics
  getStudentsStats: async () => {
    return api.get('/admin/students/stats/overview');
  },

  // Get courses list for filters
  getCoursesList: async () => {
    return api.get('/admin/courses/list');
  },

  // Bulk operations
  bulkUpdateStudents: async (studentIds, updateData) => {
    return api.post('/admin/students/bulk-update', { studentIds, updateData });
  },

  // Export students data
  exportStudents: async (params = {}) => {
    return api.get('/admin/students/export', { 
      params,
      responseType: 'blob'
    });
  },

  // Preview student import
  previewStudentImport: async (formData) => {
    return api.post('/admin/students/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Import students
  importStudents: async (formData) => {
    return api.post('/admin/students/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Get student by admission number
  getStudentByAdmissionNo: async (admissionNo) => {
    return api.get(`/admin/students/by-admission/${admissionNo}`);
  }
};

export default adminAPI; 