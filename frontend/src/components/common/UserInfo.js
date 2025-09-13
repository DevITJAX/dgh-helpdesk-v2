import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Button
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const UserInfo = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Debug logging
  console.log('UserInfo - user:', user);
  console.log('UserInfo - isAuthenticated:', isAuthenticated);
  console.log('UserInfo - loading:', loading);

  const handleRefresh = () => {
    console.log('UserInfo: Manual refresh triggered');
    console.log('UserInfo: Current localStorage token:', localStorage.getItem('authToken'));
    window.location.reload();
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Loading user information...
        </Typography>
      </Paper>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Not authenticated
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Current User Information
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          size="small"
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Username:
          </Typography>
          <Typography variant="body1">
            {user.username || 'N/A'}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Display Name:
          </Typography>
          <Typography variant="body1">
            {user.displayName || user.fullName || 'N/A'}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Email:
          </Typography>
          <Typography variant="body1">
            {user.email || 'N/A'}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Role:
          </Typography>
          <Chip 
            label={user.role || 'N/A'} 
            color={user.role === 'ADMIN' ? 'error' : user.role === 'TECHNICIAN' ? 'warning' : 'default'}
            size="small"
          />
        </Box>
        
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Department:
          </Typography>
          <Typography variant="body1">
            {user.department || 'N/A'}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            User ID:
          </Typography>
          <Typography variant="body1" fontFamily="monospace">
            {user.id || 'N/A'}
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ mt: 2, mb: 1 }} />
      <Typography variant="caption" color="text.secondary">
        Raw user object: {JSON.stringify(user, null, 2)}
      </Typography>
    </Paper>
  );
};

export default UserInfo; 