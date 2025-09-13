import apiClient from './apiClient';

// In-memory token storage (more secure than localStorage)
let authToken = null;
let refreshToken = null;
let tokenExpiry = null;

// Token refresh function
const refreshAuthToken = async () => {
  try {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/api/auth/refresh', {
      refreshToken: refreshToken
    });

    const { token: newToken, refreshToken: newRefreshToken, expiresIn } = response.data;
    
    // Update in-memory tokens
    authToken = newToken;
    refreshToken = newRefreshToken;
    tokenExpiry = Date.now() + (expiresIn * 1000);

    return newToken;
  } catch (error) {
    // Clear tokens on refresh failure
    authToken = null;
    refreshToken = null;
    tokenExpiry = null;
    throw new Error('Token refresh failed');
  }
};

// Check if token is expired or will expire soon (within 5 minutes)
const isTokenExpired = () => {
  if (!tokenExpiry) return true;
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  return Date.now() >= (tokenExpiry - fiveMinutes);
};

export const authService = {
  // Set tokens in memory
  setTokens: (token, refresh, expiresIn) => {
    authToken = token;
    refreshToken = refresh;
    tokenExpiry = Date.now() + (expiresIn * 1000);
  },

  // Get current token (with automatic refresh if needed)
  getToken: async () => {
    if (!authToken) {
      throw new Error('No authentication token');
    }

    // For this implementation, we don't have refresh tokens
    // Just check if the token is expired
    if (isTokenExpired()) {
      throw new Error('Token expired');
    }

    return authToken;
  },

  // Get token expiry timestamp
  getTokenExpiry: () => tokenExpiry,

  // Check if token is expired
  isTokenExpired,

  // Clear all tokens from memory
  clearTokens: () => {
    authToken = null;
    refreshToken = null;
    tokenExpiry = null;
  },

  login: async (username, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        username,
        password,
      });
      
      const { token, userId, username: responseUsername, fullName, email, department, role, message } = response.data;
      
      // Store token in memory (session-based auth)
      authToken = token;
      tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours expiry
      console.log('Stored session token:', token.substring(0, 20) + '...');
      console.log('Token expiry set to:', new Date(tokenExpiry));
      
      // Create user object from response
      const user = {
        userId,
        username: responseUsername,
        fullName,
        email,
        department,
        role,
        isActive: true
      };
      
      return { token, user };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  logout: async () => {
    try {
      if (authToken) {
        await apiClient.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens from memory
      authService.clearTokens();
    }
  },

  checkAuth: async () => {
    try {
      // For session-based auth, we don't need to pass the token in headers
      const response = await apiClient.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw new Error('Authentication check failed');
    }
  },

  getUserInfo: async () => {
    try {
      // For session-based auth, we don't need to pass the token in headers
      // The session cookie will be automatically included
      const response = await apiClient.get('/api/auth/me');
      
      // Handle the response format from the backend
      const { userId, username, fullName, email, department, role, isActive } = response.data;
      
      return {
        userId,
        username,
        fullName,
        email,
        department,
        role,
        isActive: isActive !== false // Default to true if not specified
      };
    } catch (error) {
      console.error('Failed to get user info:', error);
      throw new Error('Failed to get user info');
    }
  },

  // Verify token without automatic refresh
  verifyToken: async (token) => {
    try {
      const response = await apiClient.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Session verification failed');
    }
  },

  // Manual token refresh
  refreshToken: refreshAuthToken
};
