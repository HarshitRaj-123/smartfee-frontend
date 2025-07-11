import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { renderIcon } from '../../../utils/iconMapper';
import userAPI from '../../../services/userAPI';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../styles/toast.css';

// Add custom styles for white background toasts
const customToastStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 9999,
};

// Inject custom CSS for toast styling
if (typeof document !== 'undefined') {
    const styleId = 'custom-toast-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .Toastify__toast {
                background-color: white !important;
                color: #374151 !important;
                border: 1px solid #E5E7EB !important;
                border-radius: 8px !important;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            }
            
            .Toastify__toast--success {
                border-color: #10B981 !important;
            }
            
            .Toastify__toast--success .Toastify__toast-icon {
                color: #10B981 !important;
            }
            
            .Toastify__toast--error {
                border-color: #EF4444 !important;
            }
            
            .Toastify__toast--error .Toastify__toast-icon {
                color: #EF4444 !important;
            }
            
            .Toastify__close-button {
                color: #6B7280 !important;
            }
        `;
        document.head.appendChild(style);
    }
}

const Users = () => {
    const { user, isLoading, isInitialized } = useAuth();
    
    // UI State
    const [activeTab, setActiveTab] = useState('admins');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState({ 
        active: false, 
        inactive: false,
        lastLogin24h: false,
        lastLogin7d: false,
        lastLogin30d: false,
        neverLoggedIn: false
    });
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    
    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [statusAction, setStatusAction] = useState({ user: null, newStatus: false });
    const [userToDelete, setUserToDelete] = useState(null);
    
    // Data State
    const [users, setUsers] = useState({ admins: [], accountants: [] });
    const [userActivityLogs, setUserActivityLogs] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingUserActivities, setLoadingUserActivities] = useState(false);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false);

    // Get visible tabs based on user role
    const getVisibleTabs = () => {
        if (!user?.role) return [];
        return user.role === 'super_admin' ? ['admins', 'accountants'] : 
               user.role === 'admin' ? ['accountants'] : [];
    };

    const visibleTabs = getVisibleTabs();

    // Fetch users by role
    const fetchUsersByRole = async (role) => {
        if (loadingUsers) return; // Prevent concurrent calls
        
        setLoadingUsers(true);
        setError(null);
        
        try {
            const statusFilter = activeFilters.active && activeFilters.inactive ? 'all' :
                                activeFilters.active ? 'active' :
                                activeFilters.inactive ? 'inactive' : 'all';

            const response = await userAPI.getUsersByRole(role, {
                search: searchTerm,
                status: statusFilter,
                page: 1,
                limit: 50
            });

            if (response?.data?.success) {
                setUsers(prev => ({
                    ...prev,
                    [role + 's']: response.data.data.users || []
                }));
            } else {
                setError(`Failed to load ${role}s`);
            }
        } catch (error) {
            console.error(`Error fetching ${role}s:`, error);
            setError(`Failed to load ${role}s. Please try again.`);
        } finally {
            setLoadingUsers(false);
        }
    };

    // Fetch user-specific login activities
    const fetchUserActivityLogs = async (userId) => {
        if (loadingUserActivities) return;
        
        setLoadingUserActivities(true);
        
        try {
            const response = await userAPI.getLoginActivities({
                userId: userId,
                page: 1,
                limit: 50,
                days: 90 // Get last 90 days of activity
            });

            if (response?.data?.success) {
                const activities = response.data.data.activities || [];
                
                // Filter out unrealistic dates (future dates or dates beyond 2024)
                const now = new Date();
                const currentYear = now.getFullYear();
                
                const filteredActivities = activities.filter(activity => {
                    const activityDate = new Date(activity.timestamp);
                    
                    // Remove activities with future dates or dates beyond current year
                    return activityDate <= now && activityDate.getFullYear() <= currentYear;
                });
                
                setUserActivityLogs(filteredActivities);
            }
        } catch (error) {
            console.error('Error fetching user activity logs:', error);
            toast.error('Failed to load user activity logs');
        } finally {
            setLoadingUserActivities(false);
        }
    };

    // Initialize data when component mounts
    useEffect(() => {
        if (user && visibleTabs.length > 0 && !initialized) {
            setInitialized(true);
            
            // Set initial tab
            if (!visibleTabs.includes(activeTab)) {
                setActiveTab(visibleTabs[0]);
            }
            
            // Fetch data for all visible tabs
            visibleTabs.forEach(tab => {
                const role = tab.slice(0, -1);
                fetchUsersByRole(role);
            });
        }
    }, [user, visibleTabs.join(','), initialized]);

    // Handle search and filter changes (debounced)
    useEffect(() => {
        if (!initialized) return;
        
        const timeoutId = setTimeout(() => {
            if (visibleTabs.length > 0) {
                const role = activeTab.slice(0, -1);
                fetchUsersByRole(role);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, activeFilters.active, activeFilters.inactive, activeFilters.lastLogin24h, 
        activeFilters.lastLogin7d, activeFilters.lastLogin30d, activeFilters.neverLoggedIn, 
        activeTab, initialized]);

    // Get current users for active tab
    const getCurrentUsers = () => users[activeTab] || [];

    // Filter users client-side as backup
    const filteredUsers = getCurrentUsers().filter(userItem => {
        if (!userItem) return false;
        
        // Search filter
        const matchesSearch = (userItem.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (userItem.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;
        
        // Status filters
        const hasStatusFilter = activeFilters.active || activeFilters.inactive;
        const hasLastLoginFilter = activeFilters.lastLogin24h || activeFilters.lastLogin7d || 
                                   activeFilters.lastLogin30d || activeFilters.neverLoggedIn;
        
        let matchesStatus = true;
        let matchesLastLogin = true;
        
        // Apply status filters
        if (hasStatusFilter) {
            matchesStatus = false;
            if (activeFilters.active && userItem.isActive) matchesStatus = true;
            if (activeFilters.inactive && !userItem.isActive) matchesStatus = true;
        }
        
        // Apply last login filters
        if (hasLastLoginFilter) {
            matchesLastLogin = false;
            const now = new Date();
            const lastLogin = userItem.lastLogin ? new Date(userItem.lastLogin) : null;
            
            if (activeFilters.neverLoggedIn && !lastLogin) {
                matchesLastLogin = true;
            } else if (lastLogin) {
                const diffInHours = (now - lastLogin) / (1000 * 60 * 60);
                const diffInDays = diffInHours / 24;
                
                if (activeFilters.lastLogin24h && diffInHours <= 24) matchesLastLogin = true;
                if (activeFilters.lastLogin7d && diffInDays <= 7) matchesLastLogin = true;
                if (activeFilters.lastLogin30d && diffInDays <= 30) matchesLastLogin = true;
            }
        }
        
        return matchesStatus && matchesLastLogin;
    });

    // Handle user row click to show activity logs
    const handleUserRowClick = (userItem) => {
        setSelectedUser(userItem);
        setShowActivityModal(true);
        fetchUserActivityLogs(userItem.id);
    };

    // Event handlers
    const handleStatusToggle = async (userId) => {
        const userToUpdate = getCurrentUsers().find(u => u.id === userId);
        if (!userToUpdate) return;

        // Show confirmation modal
        setStatusAction({ 
            user: userToUpdate, 
            newStatus: !userToUpdate.isActive 
        });
        setShowStatusModal(true);
    };

    const confirmStatusChange = async () => {
        try {
            const { user: userToUpdate, newStatus } = statusAction;
            
            const response = await userAPI.updateUserStatus(userToUpdate.id, newStatus);
            
            if (response.data.success) {
                // Refresh current tab data
                const role = activeTab.slice(0, -1);
                fetchUsersByRole(role);
                
                // Show success message
                toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`, {
                    style: {
                        backgroundColor: 'white',
                        color: '#10B981',
                        border: '1px solid #10B981',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontWeight: '500',
                    },
                    iconTheme: {
                        primary: '#10B981',
                        secondary: 'white',
                    },
                });
                
                // Close modal
                setShowStatusModal(false);
                setStatusAction({ user: null, newStatus: false });
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            if (error.response?.data?.message) {
                toast.error(`Failed to update user status: ${error.response.data.message}`, {
                    style: {
                        backgroundColor: 'white',
                        color: '#EF4444',
                        border: '1px solid #EF4444',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontWeight: '500',
                    },
                    iconTheme: {
                        primary: '#EF4444',
                        secondary: 'white',
                    },
                });
            } else {
                toast.error('Failed to update user status. Please try again.', {
                    style: {
                        backgroundColor: 'white',
                        color: '#EF4444',
                        border: '1px solid #EF4444',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontWeight: '500',
                    },
                    iconTheme: {
                        primary: '#EF4444',
                        secondary: 'white',
                    },
                });
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        const userToDelete = getCurrentUsers().find(u => u.id === userId);
        if (!userToDelete) return;

        // Show confirmation modal
        setUserToDelete(userToDelete);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        try {
            const response = await userAPI.deleteUser(userToDelete.id);
            
            if (response.data.success) {
                // Refresh current tab data
                const role = activeTab.slice(0, -1);
                fetchUsersByRole(role);
                
                toast.success('User deleted successfully', {
                    style: {
                        backgroundColor: 'white',
                        color: '#10B981',
                        border: '1px solid #10B981',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontWeight: '500',
                    },
                    iconTheme: {
                        primary: '#10B981',
                        secondary: 'white',
                    },
                });
                
                // Close modal
                setShowDeleteModal(false);
                setUserToDelete(null);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            if (error.response?.data?.message) {
                toast.error(`Failed to delete user: ${error.response.data.message}`);
            } else {
                toast.error('Failed to delete user. Please try again.');
            }
        }
    };

    const handleEditUser = (userItem) => {
        setSelectedUser(userItem);
        setShowEditModal(true);
    };

    const handleSetPassword = (userItem) => {
        setSelectedUser(userItem);
        setShowPasswordModal(true);
    };

    const handleFilterChange = (filterType) => {
        setActiveFilters(prev => ({
            ...prev,
            [filterType]: !prev[filterType]
        }));
    };

    const getActionBadgeStyle = (type) => {
        const styles = {
            success: 'bg-green-100 text-green-800',
            warning: 'bg-amber-100 text-amber-800',
            info: 'bg-blue-100 text-blue-800',
            error: 'bg-red-100 text-red-800'
        };
        return styles[type] || 'bg-gray-100 text-gray-800';
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Never';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes} minutes ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hours ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    // Loading states
    if (!user || isLoading || !isInitialized) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading user information...</p>
                </div>
            </div>
        );
    }

    if (visibleTabs.length === 0) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
                    <p className="text-gray-600">You don't have permission to access user management.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Custom Toast Styles */}
            <style jsx>{`
                .Toastify__toast {
                    background-color: white !important;
                    color: #374151 !important;
                    border: 1px solid #E5E7EB !important;
                    border-radius: 8px !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                }
                
                .Toastify__toast--success {
                    border-color: #10B981 !important;
                }
                
                .Toastify__toast--success .Toastify__toast-icon {
                    color: #10B981 !important;
                }
                
                .Toastify__toast--error {
                    border-color: #EF4444 !important;
                }
                
                .Toastify__toast--error .Toastify__toast-icon {
                    color: #EF4444 !important;
                }
                
                .Toastify__close-button {
                    color: #6B7280 !important;
                }
            `}</style>

            {/* Header Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    {visibleTabs.includes('admins') && (
                        <button
                            onClick={() => setActiveTab('admins')}
                            className={`px-6 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'admins'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Admins
                        </button>
                    )}
                    {visibleTabs.includes('accountants') && (
                        <button
                            onClick={() => setActiveTab('accountants')}
                            className={`px-6 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'accountants'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Accountants
                        </button>
                    )}
                </div>
                
                {/* Add User Button */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    {renderIcon('Add')}
                    Add User
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {renderIcon('Search', 'h-5 w-5 text-gray-400')}
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                    />
                </div>
                
                <div className="relative">
                    <button
                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                            Object.values(activeFilters).some(Boolean)
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {renderIcon('FilterList')}
                        Filter
                        {Object.values(activeFilters).some(Boolean) && (
                            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                                {Object.values(activeFilters).filter(Boolean).length}
                            </span>
                        )}
                    </button>
                    
                    {isFilterDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="p-4">
                                {/* Status Filters */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Status</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={activeFilters.active}
                                                onChange={() => handleFilterChange('active')}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm">Active Users</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={activeFilters.inactive}
                                                onChange={() => handleFilterChange('inactive')}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm">Inactive Users</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-200 mb-4"></div>

                                {/* Last Login Filters */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Last Login</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={activeFilters.lastLogin24h}
                                                onChange={() => handleFilterChange('lastLogin24h')}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm">Last 24 hours</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={activeFilters.lastLogin7d}
                                                onChange={() => handleFilterChange('lastLogin7d')}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm">Last 7 days</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={activeFilters.lastLogin30d}
                                                onChange={() => handleFilterChange('lastLogin30d')}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm">Last 30 days</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={activeFilters.neverLoggedIn}
                                                onChange={() => handleFilterChange('neverLoggedIn')}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm">Never logged in</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Clear Filters Button */}
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                    <button
                                        onClick={() => setActiveFilters({
                                            active: false,
                                            inactive: false,
                                            lastLogin24h: false,
                                            lastLogin7d: false,
                                            lastLogin30d: false,
                                            neverLoggedIn: false
                                        })}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Instruction Text */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                    {renderIcon('Info', 'h-4 w-4 text-blue-600')}
                    <p className="text-blue-800 text-sm">
                        Click on any user row to view their activity logs and login history
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loadingUsers ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="ml-2 text-gray-600">Loading users...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((userItem) => (
                                    <tr 
                                        key={userItem.id} 
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleUserRowClick(userItem)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                                                        {userItem.initials || userItem.name?.charAt(0) || 'U'}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {userItem.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={userItem.isActive}
                                                    onChange={() => handleStatusToggle(userItem.id)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatTimestamp(userItem.lastLogin)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                          <div className="flex items-center space-x-2 justify-center">
                                            <button
                                              onClick={() => handleEditUser(userItem)}
                                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                              title="Edit User"
                                            >
                                              {renderIcon('Edit', 'h-4 w-4')}
                                            </button>
                                            <button
                                              onClick={() => handleSetPassword(userItem)}
                                              className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 transition-colors"
                                              title="Reset Password"
                                            >
                                              {renderIcon('VpnKey', 'h-4 w-4')}
                                            </button>
                                            <button
                                              onClick={() => handleDeleteUser(userItem.id)}
                                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                                              title="Delete User"
                                            >
                                              {renderIcon('Delete', 'h-4 w-4')}
                                            </button>
                                          </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                        Showing 1 to {filteredUsers.length} of {filteredUsers.length} results
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                            Previous
                        </button>
                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                            1
                        </button>
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Simple Modals */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Add New User</h3>
                        <p className="text-gray-600 mb-4">Add user functionality coming soon...</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Edit User</h3>
                        <p className="text-gray-600 mb-4">Edit user functionality coming soon...</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Reset Password</h3>
                        <p className="text-gray-600 mb-4">Password reset functionality coming soon...</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center mb-4">
                            {renderIcon('Delete', 'h-6 w-6 text-red-600 mr-3')}
                            <h3 className="text-lg font-medium">Confirm Deletion</h3>
                        </div>
                        
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete{' '}
                            <strong className="text-gray-900">{userToDelete?.name}</strong>?
                            <span className="block mt-2 text-sm text-red-600">
                                ⚠️ This action cannot be undone. All associated data will be permanently removed.
                            </span>
                        </p>
                        
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setUserToDelete(null);
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteUser}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Confirmation Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center mb-4">
                            {renderIcon('Info', 'h-6 w-6 text-blue-600 mr-3')}
                            <h3 className="text-lg font-medium">Confirm Status Change</h3>
                        </div>
                        
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to{' '}
                            <span className={`font-semibold ${statusAction.newStatus ? 'text-green-600' : 'text-red-600'}`}>
                                {statusAction.newStatus ? 'activate' : 'deactivate'}
                            </span>{' '}
                            <strong>{statusAction.user?.name}</strong>?
                            {!statusAction.newStatus && (
                                <span className="block mt-2 text-sm text-amber-600">
                                    ⚠️ This will immediately log out the user if they are currently signed in.
                                </span>
                            )}
                        </p>
                        
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setStatusAction({ user: null, newStatus: false });
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStatusChange}
                                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                                    statusAction.newStatus 
                                        ? 'bg-green-600 hover:bg-green-700' 
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {statusAction.newStatus ? 'Activate User' : 'Deactivate User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Activity Modal */}
            {showActivityModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    {renderIcon('History', 'h-6 w-6 text-blue-600 mr-3')}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {selectedUser?.name} ({selectedUser?.email})
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowActivityModal(false);
                                        setSelectedUser(null);
                                        setUserActivityLogs([]);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    {renderIcon('Close', 'h-6 w-6')}
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-auto">
                            {loadingUserActivities ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-gray-600">Loading activity logs...</span>
                                </div>
                            ) : userActivityLogs.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-4">
                                        {renderIcon('EventNote', 'h-12 w-12 mx-auto')}
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Activity Found</h4>
                                    <p className="text-gray-500">This user has no recorded activity in the last 90 days.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {userActivityLogs.map((activity) => (
                                                <tr key={activity.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeStyle(activity.type)}`}>
                                                            {activity.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {activity.details}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {activity.ip}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {activity.deviceInfo?.browser || 'Unknown'} on {activity.deviceInfo?.os || 'Unknown'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatTimestamp(activity.timestamp)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    {userActivityLogs.length > 0 && (
                                        `Showing ${userActivityLogs.length} activities from the last 90 days`
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        setShowActivityModal(false);
                                        setSelectedUser(null);
                                        setUserActivityLogs([]);
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                toastStyle={{
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                }}
                progressStyle={{
                    background: 'linear-gradient(90deg, #10B981, #059669)',
                }}
            />
        </div>
    );
};

export default Users; 