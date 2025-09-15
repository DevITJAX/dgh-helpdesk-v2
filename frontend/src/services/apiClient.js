import axios from 'axios';
import { authService } from './authService';

// Use explicit check so empty string ('') is respected to indicate same-origin
const resolvedBaseURL = (typeof process.env.REACT_APP_API_BASE_URL !== 'undefined')
  ? process.env.REACT_APP_API_BASE_URL
  : 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: resolvedBaseURL, // '' means same-origin when fronted by Nginx proxy
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for session-based auth
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Debug: Log the API base URL being used
console.log('API Base URL:', apiClient.defaults.baseURL);
console.log('Environment REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);

// Request interceptor for session-based authentication
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // For session-based auth, we don't need to add Authorization headers
      // The session cookie will be automatically included by the browser
      const tokenExpiry = authService.getTokenExpiry();
      if (tokenExpiry) {
        console.log('Session-based request - cookies will be included automatically');
        console.log('Request URL:', config.url);
        console.log('Request method:', config.method);
        console.log('With credentials:', config.withCredentials);
      }
    } catch (error) {
      console.warn('Request interceptor error:', error.message);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized errors (session expired)
    if (error.response?.status === 401) {
      console.log('Session expired or unauthorized - clearing auth state');
      authService.clearTokens();
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle other errors
    if (error.response) {
      const { status } = error.response;
      
      // Handle server errors
      if (status >= 500) {
        console.error('Server error:', error.response.data);
      }
      
      // Handle forbidden access
      if (status === 403) {
        console.error('Access forbidden:', error.response.data);
      }
    } else if (error.request) {
      // Network error - backend is down or unreachable
      console.error('Network error - backend may be down');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
