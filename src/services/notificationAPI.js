import api from './api';

export const notificationAPI = {
    // Get all notifications for the current user
    getNotifications: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return await api.get(`/api/notifications${queryParams ? `?${queryParams}` : ''}`);
    },

    // Get notification by ID
    getNotificationById: async (notificationId) => {
        return await api.get(`/api/notifications/${notificationId}`);
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        return await api.patch(`/api/notifications/${notificationId}/read`);
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        return await api.patch('/api/notifications/mark-all-read');
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
        return await api.delete(`/api/notifications/${notificationId}`);
    },

    // Delete all read notifications
    deleteAllRead: async () => {
        return await api.delete('/api/notifications/read');
    },

    // Get unread notification count
    getUnreadCount: async () => {
        return await api.get('/api/notifications/unread-count');
    },

    // Send notification (admin/accountant only)
    sendNotification: async (notificationData) => {
        return await api.post('/api/notifications/send', notificationData);
    },

    // Send bulk notifications (admin/accountant only)
    sendBulkNotification: async (notificationData) => {
        return await api.post('/api/notifications/send-bulk', notificationData);
    },

    // Create notification template (admin only)
    createTemplate: async (templateData) => {
        return await api.post('/api/notifications/templates', templateData);
    },

    // Get notification templates
    getTemplates: async () => {
        return await api.get('/api/notifications/templates');
    },

    // Update notification template
    updateTemplate: async (templateId, templateData) => {
        return await api.put(`/api/notifications/templates/${templateId}`, templateData);
    },

    // Delete notification template
    deleteTemplate: async (templateId) => {
        return await api.delete(`/api/notifications/templates/${templateId}`);
    },

    // Get notification settings
    getNotificationSettings: async () => {
        return await api.get('/api/notifications/settings');
    },

    // Update notification settings
    updateNotificationSettings: async (settings) => {
        return await api.put('/api/notifications/settings', settings);
    },

    // Subscribe to push notifications
    subscribePushNotifications: async (subscription) => {
        return await api.post('/api/notifications/subscribe', subscription);
    },

    // Unsubscribe from push notifications
    unsubscribePushNotifications: async () => {
        return await api.delete('/api/notifications/subscribe');
    }
};

export default notificationAPI; 