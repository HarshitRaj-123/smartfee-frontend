import api from './api';

const sessionAPI = {
  // Get current user's session history
  getMySessionHistory: async (params = {}) => {
    const { page = 1, limit = 20, status } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });
    
    return api.get(`/sessions/my-sessions?${queryParams}`);
  },

  // Get active sessions count for current user
  getActiveSessionsCount: async () => {
    return api.get('/sessions/active-count');
  },

  // End all other active sessions (keep current one)
  endAllOtherSessions: async () => {
    return api.post('/sessions/end-all-others');
  },

  // Admin: Get any user's session history
  getUserSessionHistory: async (userId, params = {}) => {
    const { page = 1, limit = 20, status } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });
    
    return api.get(`/sessions/user/${userId}?${queryParams}`);
  },

  // Admin: End all sessions for a specific user
  endAllUserSessions: async (userId) => {
    return api.post(`/sessions/user/${userId}/end-all`);
  },

  // Admin: Get session statistics
  getSessionStats: async (days = 30) => {
    return api.get(`/sessions/stats?days=${days}`);
  }
};

export default sessionAPI; 