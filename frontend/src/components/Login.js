import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Avatar,
  Divider
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useSecureAuth } from '../hooks/useSecureAuth';
import dghLogo from '../dgh_logo.png';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  
  const { secureLogin, isAuthenticated, error, clearError } = useSecureAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Show auth context errors
  useEffect(() => {
    if (error) {
      setGlobalError(error);
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear global error when user starts typing
    if (globalError) {
      setGlobalError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const performLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setGlobalError(null);
    setDebugInfo('Attempting login...');

    try {
      console.log('Login attempt with:', { username: formData.username, password: formData.password });
      
      const result = await secureLogin(formData.username, formData.password);
      
      console.log('Login result:', result);
      setDebugInfo(`Login result: ${JSON.stringify(result, null, 2)}`);
      
      if (!result.success) {
        setGlobalError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setDebugInfo(`Login error: ${error.message}`);
      
      // Better error handling for different scenarios
      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        setGlobalError('Cannot connect to server. Please check if the backend is running.');
      } else if (error.response?.status === 401) {
        setGlobalError('Invalid username or password.');
      } else if (error.response?.status === 500) {
        setGlobalError('Server error. Please try again later.');
      } else {
        setGlobalError(error.message || 'Unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await performLogin();
  };

  const handleButtonClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await performLogin();
  };

  // Test login with correct credentials
  const testLogin = async (username, password) => {
    setFormData({ username, password });
    setDebugInfo(`Testing login with: ${username}`);
    
    // Wait a moment for state to update
    setTimeout(async () => {
      setIsSubmitting(true);
      setGlobalError(null);
      
      try {
        const result = await secureLogin(username, password);
        setDebugInfo(`Test login result: ${JSON.stringify(result, null, 2)}`);
        
        if (!result.success) {
          setGlobalError(result.error || 'Test login failed.');
        }
      } catch (error) {
        console.error('Test login error:', error);
        setDebugInfo(`Test login error: ${error.message}`);
        setGlobalError(error.message || 'Test login failed.');
      } finally {
        setIsSubmitting(false);
      }
    }, 100);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        p: 2
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={8}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* DGH Logo - Centered */}
          <Box 
            sx={{ 
              mb: 4, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Avatar
              src={dghLogo}
              alt="DGH Logo"
              sx={{ 
                width: 100, 
                height: 100, 
                mb: 3,
                borderRadius: '16px',
                boxShadow: 4,
                border: '3px solid #1976d2'
              }}
            />
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'primary.main',
                textAlign: 'center',
                mb: 1
              }}
            >
              DGH HelpDesk
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                textAlign: 'center',
                fontWeight: 'medium'
              }}
            >
              Direction Générale de l'Hydraulique
            </Typography>
          </Box>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 4, 
              textAlign: 'center',
              maxWidth: 300
            }}
          >
            Sign in to access the IT HelpDesk Management System
          </Typography>

          {globalError && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {globalError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleInputChange}
              error={!!errors.username}
              helperText={errors.username}
              disabled={isSubmitting}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={isSubmitting}
              sx={{ mb: 3 }}
            />
            
            <Button
              type="button"
              fullWidth
              variant="contained"
              sx={{ 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                boxShadow: 3,
                mb: 2
              }}
              disabled={isSubmitting}
              onClick={handleButtonClick}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Copyright Text */}
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                mt: 3,
                textAlign: 'center',
                display: 'block'
              }}
            >
              © 2025 Direction Générale de l'Hydraulique - Rabat, Morocco
            </Typography>
          </Box>

          {/* Debug Information */}
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, width: '100%' }}>
              <Typography variant="caption" component="pre" sx={{ fontSize: '0.7rem', whiteSpace: 'pre-wrap' }}>
                {debugInfo}
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 