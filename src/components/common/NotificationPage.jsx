import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import notificationAPI from '../../services/notificationAPI';

const NotificationPage = () => {
    const { user } = useAuth();
    const { showError, showSuccess } = useNotification();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    // Role-based configuration
    const getRoleConfig = () => {
        switch (user?.role) {
            case 'admin':
                return {
                    title: 'Notifications',
                    description: 'Manage system notifications and alerts',
                    centerTitle: 'Notification Center',
                    centerDescription: 'Send and manage notifications to users and students',
                    features: [
                        '• Send notifications',
                        '• Notification templates',
                        '• Scheduled messages',
                        '• User targeting',
                        '• Delivery tracking'
                    ]
                };
            case 'accountant':
                return {
                    title: 'Notifications',
                    description: 'Manage payment notifications and alerts',
                    centerTitle: 'Notification Center',
                    centerDescription: 'Send payment reminders and notifications to students',
                    features: [
                        '• Payment reminders',
                        '• Due date alerts',
                        '• Notification templates',
                        '• Bulk notifications',
                        '• Delivery tracking'
                    ]
                };
            case 'student':
                return {
                    title: 'Notifications',
                    description: 'View your notifications and important updates',
                    centerTitle: 'Notification Center',
                    centerDescription: 'Stay updated with important announcements and reminders',
                    features: [
                        '• Payment reminders',
                        '• Important announcements',
                        '• Due date alerts',
                        '• System notifications',
                        '• Mark as read/unread'
                    ]
                };
            default:
                return {
                    title: 'Notifications',
                    description: 'Manage your notifications',
                    centerTitle: 'Notification Center',
                    centerDescription: 'Stay updated with important information',
                    features: [
                        '• Important updates',
                        '• System notifications',
                        '• Reminders',
                        '• Announcements'
                    ]
                };
        }
    };

    const config = getRoleConfig();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationAPI.getNotifications();
            setNotifications(response.data?.notifications || response.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            showError('Failed to fetch notifications');
            
            // Mock data for development
            const mockNotifications = [
                {
                    id: 1,
                    title: 'Payment Reminder',
                    message: 'Your semester fee payment is due in 3 days.',
                    type: 'warning',
                    read: false,
                    createdAt: new Date().toISOString(),
                    priority: 'high'
                },
                {
                    id: 2,
                    title: 'System Update',
                    message: 'The system will be under maintenance on Sunday.',
                    type: 'info',
                    read: true,
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    priority: 'medium'
                }
            ];
            setNotifications(mockNotifications);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await notificationAPI.markAsRead(notificationId);
            setNotifications(prev => 
                prev.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, read: true }
                        : notification
                )
            );
            showSuccess('Notification marked as read');
        } catch (error) {
            console.error('Error marking notification as read:', error);
            showError('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev => 
                prev.map(notification => ({ ...notification, read: true }))
            );
            showSuccess('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            showError('Failed to mark all notifications as read');
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await notificationAPI.deleteNotification(notificationId);
            setNotifications(prev => 
                prev.filter(notification => notification.id !== notificationId)
            );
            showSuccess('Notification deleted');
        } catch (error) {
            console.error('Error deleting notification:', error);
            showError('Failed to delete notification');
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.read;
        if (filter === 'read') return notification.read;
        return true;
    });

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'warning':
                return '⚠️';
            case 'error':
                return '❌';
            case 'success':
                return '✅';
            case 'info':
            default:
                return 'ℹ️';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'border-l-red-500';
            case 'medium':
                return 'border-l-yellow-500';
            case 'low':
            default:
                return 'border-l-blue-500';
        }
    };

    if (loading) {
        return (
            <div className='p-6'>
                <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
                    <h1 className='text-3xl font-bold text-gray-800 mb-2'>{config.title}</h1>
                    <p className='text-gray-600'>{config.description}</p>
                </div>
                <div className='bg-white rounded-lg shadow-md p-6'>
                    <div className='text-center py-12'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto'></div>
                        <p className='mt-4 text-gray-600'>Loading notifications...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='p-6'>
            <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
                <div className='flex justify-between items-center'>
                    <div>
                        <h1 className='text-3xl font-bold text-gray-800 mb-2'>{config.title}</h1>
                        <p className='text-gray-600'>{config.description}</p>
                    </div>
                    {notifications.length > 0 && (
                        <div className='flex space-x-2'>
                            <button
                                onClick={markAllAsRead}
                                className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
                            >
                                Mark All Read
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className='bg-white rounded-lg shadow-md p-6'>
                    <div className='text-center py-12'>
                        <div className='text-6xl text-gray-300 mb-4'>🔔</div>
                        <h2 className='text-2xl font-semibold text-gray-700 mb-2'>{config.centerTitle}</h2>
                        <p className='text-gray-500 mb-4'>{config.centerDescription}</p>
                        <div className='bg-gray-50 rounded-lg p-4 max-w-md mx-auto'>
                            <h3 className='font-medium text-gray-700 mb-2'>Features:</h3>
                            <ul className='text-sm text-gray-600 space-y-1'>
                                {config.features.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='space-y-6'>
                    {/* Filter Tabs */}
                    <div className='bg-white rounded-lg shadow-md p-6'>
                        <div className='flex space-x-4'>
                            {['all', 'unread', 'read'].map((filterType) => (
                                <button
                                    key={filterType}
                                    onClick={() => setFilter(filterType)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        filter === filterType
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                                    {filterType === 'unread' && (
                                        <span className='ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full'>
                                            {notifications.filter(n => !n.read).length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className='space-y-4'>
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${getPriorityColor(notification.priority)} ${
                                    !notification.read ? 'bg-blue-50' : ''
                                }`}
                            >
                                <div className='flex items-start justify-between'>
                                    <div className='flex items-start space-x-3 flex-1'>
                                        <div className='text-2xl'>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className='flex-1'>
                                            <div className='flex items-center space-x-2'>
                                                <h3 className={`text-lg font-semibold ${
                                                    !notification.read ? 'text-gray-900' : 'text-gray-700'
                                                }`}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.read && (
                                                    <span className='bg-blue-500 text-white text-xs px-2 py-1 rounded-full'>
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                            <p className='text-gray-600 mt-1'>{notification.message}</p>
                                            <p className='text-sm text-gray-400 mt-2'>
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        {!notification.read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className='px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors'
                                            >
                                                Mark Read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification.id)}
                                            className='px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors'
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredNotifications.length === 0 && (
                        <div className='bg-white rounded-lg shadow-md p-6'>
                            <div className='text-center py-8'>
                                <div className='text-4xl text-gray-300 mb-4'>📭</div>
                                <h3 className='text-lg font-semibold text-gray-700 mb-2'>
                                    No {filter !== 'all' ? filter : ''} notifications
                                </h3>
                                <p className='text-gray-500'>
                                    {filter === 'unread' 
                                        ? 'You\'re all caught up!'
                                        : filter === 'read'
                                        ? 'No read notifications found.'
                                        : 'No notifications available.'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationPage; 