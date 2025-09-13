import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

/**
 * Custom hook for secure authentication with automatic token refresh
 * Provides enhanced security features and better error handling
 */
export const useSecureAuth = () => {
  const auth = useAuth();
  const refreshTimeoutRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Setup automatic token refresh
  const setupTokenRefresh = useCallback(() => {
    if (!auth.isAuthenticated || !auth.token) {
      return;
    }

    // Clear existing timers
    clearTimers();

    // Set up periodic token refresh (every 10 minutes)
    refreshIntervalRef.current = setInterval(async () => {
      try {
        await auth.refreshToken();
      } catch (error) {
        console.error('Automatic token refresh failed:', error);
        // Force logout on refresh failure
        await auth.logout();
      }
    }, 10 * 60 * 1000); // 10 minutes

    // Set up one-time refresh before token expires (5 minutes before)
    const tokenExpiry = authService.getTokenExpiry();
    if (tokenExpiry) {
      const timeUntilRefresh = tokenExpiry - Date.now() - (5 * 60 * 1000); // 5 minutes before expiry
      
      if (timeUntilRefresh > 0) {
        refreshTimeoutRef.current = setTimeout(async () => {
          try {
            await auth.refreshToken();
            // Setup next refresh
            setupTokenRefresh();
          } catch (error) {
            console.error('Scheduled token refresh failed:', error);
            await auth.logout();
          }
        }, timeUntilRefresh);
      }
    }
  }, [auth.isAuthenticated, auth.token, auth.refreshToken, auth.logout, clearTimers]);

  // Enhanced login with security checks
  const secureLogin = useCallback(async (username, password) => {
    try {
      // Clear any existing tokens
      authService.clearTokens();
      
      // Perform login
      const result = await auth.login(username, password);
      
      if (result.success) {
        // Setup automatic token refresh
        setupTokenRefresh();
      }
      
      return result;
    } catch (error) {
      console.error('Secure login failed:', error);
      return { success: false, error: error.message };
    }
  }, [auth.login, setupTokenRefresh]);

  // Enhanced logout with cleanup
  const secureLogout = useCallback(async () => {
    try {
      // Clear timers first
      clearTimers();
      
      // Perform logout
      await auth.logout();
    } catch (error) {
      console.error('Secure logout failed:', error);
      // Force cleanup even if logout fails
      authService.clearTokens();
      clearTimers();
    }
  }, [auth.logout, clearTimers]);

  // Manual token refresh with error handling
  const manualRefresh = useCallback(async () => {
    try {
      const newToken = await auth.refreshToken();
      setupTokenRefresh();
      return { success: true, token: newToken };
    } catch (error) {
      console.error('Manual token refresh failed:', error);
      await secureLogout();
      return { success: false, error: error.message };
    }
  }, [auth.refreshToken, setupTokenRefresh, secureLogout]);

  // Check if user session is still valid
  const checkSessionValidity = useCallback(async () => {
    try {
      if (!auth.isAuthenticated) {
        return false;
      }

      const user = await authService.getUserInfo();
      return !!user;
    } catch (error) {
      console.error('Session validity check failed:', error);
      await secureLogout();
      return false;
    }
  }, [auth.isAuthenticated, secureLogout]);

  // Setup token refresh when authentication state changes
  useEffect(() => {
    if (auth.isAuthenticated) {
      setupTokenRefresh();
    } else {
      clearTimers();
    }

    // Cleanup on unmount
    return () => {
      clearTimers();
    };
  }, [auth.isAuthenticated, setupTokenRefresh, clearTimers]);

  // Handle page visibility changes (pause refresh when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimers();
      } else if (auth.isAuthenticated) {
        setupTokenRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [auth.isAuthenticated, setupTokenRefresh, clearTimers]);

  return {
    ...auth,
    secureLogin,
    secureLogout,
    manualRefresh,
    checkSessionValidity,
    isTokenExpired: authService.isTokenExpired
  };
}; 