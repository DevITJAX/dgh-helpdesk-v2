import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';

const DatabaseViewer = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await userService.getUsers();
      console.log('DatabaseViewer - Raw users data:', usersData);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      setError('Failed to load users from database');
      console.error('DatabaseViewer error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load users if user is authenticated
    if (isAuthenticated && user) {
      loadUsers();
    }
  }, [isAuthenticated, user]);

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'TECHNICIAN': return 'warning';
      case 'EMPLOYEE': return 'info';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Database Users (Debug View)
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={loadUsers}
          disabled={loading}
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Display Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No users found in database
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username || user.ldapUsername}</TableCell>
                    <TableCell>{user.displayName || user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        size="small"
                        color={getRoleColor(user.role)}
                      />
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.isActive ? 'Active' : 'Inactive'} 
                        size="small"
                        color={user.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          Total users: {users.length} | 
          Admins: {users.filter(u => u.role === 'ADMIN').length} | 
          Technicians: {users.filter(u => u.role === 'TECHNICIAN').length} | 
          Employees: {users.filter(u => u.role === 'EMPLOYEE').length}
        </Typography>
      </Box>
    </Paper>
  );
};

export default DatabaseViewer; 