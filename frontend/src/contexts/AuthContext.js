import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case AUTH_ACTIONS.TOKEN_REFRESHED:
      return {
        ...state,
        token: action.payload.token,
        error: null
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const location = useLocation();

  // Check for existing session on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('AuthContext: Starting authentication check...');
        // Try to get user info using the auth service
        const user = await authService.getUserInfo();
        console.log('AuthContext: getUserInfo result:', user);
        
        if (user && user.username) {
          // Get current token from auth service
          const token = await authService.getToken();
          console.log('AuthContext: Retrieved user from service:', user);
          console.log('AuthContext: Retrieved token from service:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
          
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user, token }
          });
        } else {
          console.log('AuthContext: No valid user found, logging out. User object:', user);
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } catch (error) {
        console.error('AuthContext: Authentication check failed:', error);
        // Clear any invalid tokens
        authService.clearTokens();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      } finally {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuthStatus();
  }, [location]);

  // Login function
  const login = async (username, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const { user, token } = await authService.login(username, password);
      
      console.log('AuthContext: Storing user data:', user);
      console.log('AuthContext: Storing token:', token.substring(0, 20) + '...');
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      });
      
      return { success: true };
    } catch (error) {
      let errMsg = 'Login failed';
      
      // Handle different types of errors
      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        errMsg = 'Cannot connect to server. Please check if the backend is running.';
      } else if (error.response?.status === 401) {
        errMsg = 'Invalid username or password.';
      } else if (error.response?.status === 500) {
        errMsg = 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        errMsg = error.response.data.message;
      } else if (error.message) {
        errMsg = error.message;
      }
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errMsg
      });
      
      return { success: false, error: errMsg };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Update user function
  const updateUser = (updatedUser) => {
    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: { user: updatedUser, token: state.token }
    });
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const newToken = await authService.refreshToken();
      dispatch({
        type: AUTH_ACTIONS.TOKEN_REFRESHED,
        payload: { token: newToken }
      });
      return newToken;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    logout,
    clearError,
    updateUser,
    refreshToken
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