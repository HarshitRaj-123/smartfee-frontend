import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authAPI, { setAuthContext as setAuthAPIContext } from '../services/authAPI';
import { setAuthContext as setUserAPIContext } from '../services/userAPI';
import { setAuthContext as setNavigationAPIContext } from '../services/navigationAPI';
import { setAuthContext as setAdminAPIContext } from '../services/adminAPI';

// Initial state - no localStorage usage
const initialState = {
  isAuthenticated: false,
  user: null,
  accessToken: null, // Store in memory only
  isLoading: true, // Start with loading true to prevent premature redirects
  isInitialized: false,
  error: null,
  loginAttempts: 0,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS',
  REFRESH_TOKEN_FAILURE: 'REFRESH_TOKEN_FAILURE',
  INITIALIZE_START: 'INITIALIZE_START',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
  INCREMENT_LOGIN_ATTEMPTS: 'INCREMENT_LOGIN_ATTEMPTS',
  RESET_LOGIN_ATTEMPTS: 'RESET_LOGIN_ATTEMPTS',
  SET_INITIALIZED: 'SET_INITIALIZED',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        error: null,
        loginAttempts: 0,
        isInitialized: true,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        error: action.payload,
        loginAttempts: state.loginAttempts + 1,
        isInitialized: true,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
        isInitialized: true,
      };

    case AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        accessToken: action.payload.accessToken,
        user: action.payload.user || state.user,
        isAuthenticated: true,
        error: null,
        isInitialized: true,
        isLoading: false,
      };

    case AUTH_ACTIONS.REFRESH_TOKEN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        error: action.payload,
        isInitialized: true,
        isLoading: false,
      };

    case AUTH_ACTIONS.INITIALIZE_START:
      return {
        ...state,
        isLoading: true,
        isInitialized: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.INCREMENT_LOGIN_ATTEMPTS:
      return {
        ...state,
        loginAttempts: state.loginAttempts + 1,
      };

    case AUTH_ACTIONS.RESET_LOGIN_ATTEMPTS:
      return {
        ...state,
        loginAttempts: 0,
      };

    case AUTH_ACTIONS.SET_INITIALIZED:
      return {
        ...state,
        isInitialized: true,
        isLoading: false,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Refresh token function (defined before useEffect to avoid hoisting issues)
  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken();
      
      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS,
        payload: {
          accessToken: response.data.accessToken,
          user: response.data.user,
        },
      });
      
      return response.data.accessToken;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN_FAILURE,
        payload: error.response?.data?.message || 'Session expired',
      });
      throw error;
    }
  };

  // Initialize auth state by attempting to refresh token on app start
  useEffect(() => {
    const initializeAuth = async () => {
      // Start initialization
      dispatch({ type: AUTH_ACTIONS.INITIALIZE_START });
      
      try {
        // Try to refresh token to check if user has valid session
        const response = await authAPI.refreshToken();
        
        dispatch({
          type: AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS,
          payload: {
            accessToken: response.data.accessToken,
            user: response.data.user,
          },
        });
      } catch (error) {
        // No valid refresh token or it's expired
        dispatch({ 
          type: AUTH_ACTIONS.SET_INITIALIZED,
        });
      }
    };

    initializeAuth();
  }, []);

  // Set auth context reference for all API services whenever accessToken changes
  useEffect(() => {
    const authContextRef = {
      accessToken: state.accessToken,
      refreshToken: refreshToken,
    };
    
    setAuthAPIContext(authContextRef);
    setUserAPIContext(authContextRef);
    setNavigationAPIContext(authContextRef);
    setAdminAPIContext(authContextRef);
  }, [state.accessToken]);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await authAPI.login(email, password);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.data.user,
          accessToken: response.data.accessToken,
        },
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Inform backend to invalidate refresh token
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear context state (no localStorage to clear)
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await authAPI.updateProfile(profileData);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data.user,
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      throw error;
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Reset login attempts
  const resetLoginAttempts = () => {
    dispatch({ type: AUTH_ACTIONS.RESET_LOGIN_ATTEMPTS });
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    login,
    logout,
    refreshToken, // Expose for axios interceptor
    updateProfile,
    clearError,
    resetLoginAttempts,
    
    // Helper getters
    isLoggedIn: state.isAuthenticated && !!state.user && !!state.accessToken,
    userRole: state.user?.role,
    userName: state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
