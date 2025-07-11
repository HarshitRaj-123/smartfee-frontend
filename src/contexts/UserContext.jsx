import React, { createContext, useContext, useReducer, useEffect } from 'react';
import userAPI from '../services/userAPI';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

// Initial state
const initialState = {
  profile: null,
  dashboardData: null,
  notifications: [],
  transactions: [],
  fees: null,
  assignedStudents: [],
  isLoading: false,
  isProfileLoading: false,
  isDashboardLoading: false,
  error: null
};

// Action types
const USER_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_PROFILE_LOADING: 'SET_PROFILE_LOADING',
  SET_DASHBOARD_LOADING: 'SET_DASHBOARD_LOADING',
  SET_PROFILE: 'SET_PROFILE',
  SET_DASHBOARD_DATA: 'SET_DASHBOARD_DATA',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  SET_FEES: 'SET_FEES',
  SET_ASSIGNED_STUDENTS: 'SET_ASSIGNED_STUDENTS',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_USER_DATA: 'RESET_USER_DATA'
};

// Reducer
const userReducer = (state, action) => {
  switch (action.type) {
    case USER_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case USER_ACTIONS.SET_PROFILE_LOADING:
      return { ...state, isProfileLoading: action.payload };
    case USER_ACTIONS.SET_DASHBOARD_LOADING:
      return { ...state, isDashboardLoading: action.payload };
    case USER_ACTIONS.SET_PROFILE:
      return { ...state, profile: action.payload, isProfileLoading: false };
    case USER_ACTIONS.SET_DASHBOARD_DATA:
      return { ...state, dashboardData: action.payload, isDashboardLoading: false };
    case USER_ACTIONS.SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload };
    case USER_ACTIONS.SET_TRANSACTIONS:
      return { ...state, transactions: action.payload };
    case USER_ACTIONS.SET_FEES:
      return { ...state, fees: action.payload };
    case USER_ACTIONS.SET_ASSIGNED_STUDENTS:
      return { ...state, assignedStudents: action.payload };
    case USER_ACTIONS.UPDATE_PROFILE:
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case USER_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    case USER_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case USER_ACTIONS.RESET_USER_DATA:
      return initialState;
    default:
      return state;
  }
};

// Create context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const { isAuthenticated, user } = useAuth();
  const { showError } = useNotification();

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!isAuthenticated) return;
    
    try {
      dispatch({ type: USER_ACTIONS.SET_PROFILE_LOADING, payload: true });
      const response = await userAPI.getUserProfile();
      dispatch({ type: USER_ACTIONS.SET_PROFILE, payload: response.data.data.user });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error.message });
      // Don't show error to user for profile fetch, just use fallback
      // showError('Failed to load user profile');
    } finally {
      dispatch({ type: USER_ACTIONS.SET_PROFILE_LOADING, payload: false });
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!isAuthenticated) return;
    
    try {
      dispatch({ type: USER_ACTIONS.SET_DASHBOARD_LOADING, payload: true });
      const response = await userAPI.getDashboardData();
      dispatch({ type: USER_ACTIONS.SET_DASHBOARD_DATA, payload: response.data.data });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error.message });
      // Set fallback dashboard data
      const fallbackData = {
        userId: user?.id,
        role: user?.role,
        personalStats: {
          outstandingFees: 0,
          paidFees: 0,
          upcomingPayments: 0,
          totalTransactions: 0,
          totalUsers: 0,
          totalStudents: 0,
          totalRevenue: 0,
          systemHealth: 'Good',
          studentsAssigned: 0,
          paymentsProcessed: 0,
          pendingVerifications: 0,
          monthlyCollections: 0
        },
        recentActivities: [],
        notifications: [],
        quickActions: []
      };
      dispatch({ type: USER_ACTIONS.SET_DASHBOARD_DATA, payload: fallbackData });
    } finally {
      dispatch({ type: USER_ACTIONS.SET_DASHBOARD_LOADING, payload: false });
    }
  };

  // Fetch user notifications
  const fetchUserNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await userAPI.getUserNotifications();
      dispatch({ type: USER_ACTIONS.SET_NOTIFICATIONS, payload: response.data.data });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set empty notifications array as fallback
      dispatch({ type: USER_ACTIONS.SET_NOTIFICATIONS, payload: [] });
    }
  };

  // Fetch user transactions (for students)
  const fetchUserTransactions = async (params = {}) => {
    if (!isAuthenticated || user?.role !== 'student') return;
    
    try {
      const response = await userAPI.getUserTransactions(params);
      dispatch({ type: USER_ACTIONS.SET_TRANSACTIONS, payload: response.data.data });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Set empty transactions array as fallback
      dispatch({ type: USER_ACTIONS.SET_TRANSACTIONS, payload: [] });
    }
  };

  // Fetch user fees (for students)
  const fetchUserFees = async () => {
    if (!isAuthenticated || user?.role !== 'student') return;
    
    try {
      const response = await userAPI.getUserFees();
      dispatch({ type: USER_ACTIONS.SET_FEES, payload: response.data.data });
    } catch (error) {
      console.error('Error fetching fees:', error);
      // Set fallback fee data
      const fallbackFees = {
        totalFees: 0,
        paidFees: 0,
        outstandingFees: 0,
        dueDate: null,
        feeStructure: []
      };
      dispatch({ type: USER_ACTIONS.SET_FEES, payload: fallbackFees });
    }
  };

  // Fetch assigned students (for accountants)
  const fetchAssignedStudents = async () => {
    if (!isAuthenticated || user?.role !== 'accountant') return;
    
    try {
      const response = await userAPI.getAssignedStudents();
      dispatch({ type: USER_ACTIONS.SET_ASSIGNED_STUDENTS, payload: response.data.data });
    } catch (error) {
      console.error('Error fetching assigned students:', error);
      // Set empty assigned students array as fallback
      dispatch({ type: USER_ACTIONS.SET_ASSIGNED_STUDENTS, payload: [] });
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
      const response = await userAPI.updateUserProfile(profileData);
      dispatch({ type: USER_ACTIONS.UPDATE_PROFILE, payload: response.data.data.user });
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: USER_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await userAPI.uploadProfilePicture(formData);
      dispatch({ type: USER_ACTIONS.UPDATE_PROFILE, payload: { profilePicture: response.data.data.profilePicture } });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  };

  // Initialize user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile();
      fetchDashboardData();
      
      // Fetch role-specific data
      if (user.role === 'student') {
        fetchUserFees();
        fetchUserTransactions();
      } else if (user.role === 'accountant') {
        fetchAssignedStudents();
      }
      
      fetchUserNotifications();
    } else {
      dispatch({ type: USER_ACTIONS.RESET_USER_DATA });
    }
  }, [isAuthenticated, user]);

  // Clear error after some time
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        dispatch({ type: USER_ACTIONS.CLEAR_ERROR });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  const value = {
    // State
    ...state,
    
    // Actions
    fetchUserProfile,
    fetchDashboardData,
    fetchUserNotifications,
    fetchUserTransactions,
    fetchUserFees,
    fetchAssignedStudents,
    updateUserProfile,
    uploadProfilePicture,
    
    // Utilities
    clearError: () => dispatch({ type: USER_ACTIONS.CLEAR_ERROR }),
    refreshUserData: () => {
      fetchUserProfile();
      fetchDashboardData();
      fetchUserNotifications();
    }
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext; 