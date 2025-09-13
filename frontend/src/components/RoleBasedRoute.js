import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { canAccessRoute } from '../constants/navigationConfig';

const RoleBasedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading while authentication is being checked
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no specific role is required, allow access
  if (!requiredRole) {
    return children;
  }

  // Check if user has the required role(s)
  const hasAccess = Array.isArray(requiredRole) 
    ? requiredRole.includes(user?.role)
    : user?.role === requiredRole;

  if (!hasAccess) {
    const requiredRolesText = Array.isArray(requiredRole) 
      ? requiredRole.join(' or ')
      : requiredRole;

    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Access Denied
        </Alert>
        <Typography variant="h6" gutterBottom>
          You don't have permission to access this page.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This page requires {requiredRolesText} privileges. Please contact your administrator if you believe this is an error.
        </Typography>
      </Box>
    );
  }

  return children;
};

export default RoleBasedRoute; 