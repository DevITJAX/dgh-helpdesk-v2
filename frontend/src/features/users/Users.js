import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Tabs,
  Tab,
  Alert,
  Snackbar
} from '@mui/material';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import { userService } from '../../services/userService';
import PageLayout from '../../components/common/PageLayout';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Users = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);

  // Pagination and filtering state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    department: '',
    isActive: null
  });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        size: rowsPerPage,
        sortBy: 'fullName',
        sortDir: 'asc',
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await userService.getAllUsers(params);
      
      if (response.content) {
        // Paginated response
        setUsers(response.content);
        setTotalUsers(response.totalElements);
      } else if (Array.isArray(response)) {
        // Direct array response
        setUsers(response);
        setTotalUsers(response.length);
      } else {
        setUsers([]);
        setTotalUsers(0);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserForm(true);
  };

  const handleCloseUserForm = () => {
    setShowUserForm(false);
    setSelectedUser(null);
  };

  const handleUserSaved = async (savedUser) => {
    setShowUserForm(false);
    setSelectedUser(null);
    setSuccess(selectedUser ? 'User updated successfully!' : 'User created successfully!');
    await loadUsers();
  };

  const handleDeleteUser = async (userId) => {
    try {
      await userService.deleteUser(userId);
      setSuccess('User deleted successfully!');
      await loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await userService.activateUser(userId);
      setSuccess('User activated successfully!');
      await loadUsers();
    } catch (err) {
      console.error('Error activating user:', err);
      setError('Failed to activate user. Please try again.');
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      await userService.deactivateUser(userId);
      setSuccess('User deactivated successfully!');
      await loadUsers();
    } catch (err) {
      console.error('Error deactivating user:', err);
      setError('Failed to deactivate user. Please try again.');
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    try {
      await userService.changeUserRole(userId, newRole);
      setSuccess('User role updated successfully!');
      await loadUsers();
    } catch (err) {
      console.error('Error changing user role:', err);
      setError('Failed to update user role. Please try again.');
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <PageLayout
      title="User Management"
      subtitle="Manage system users, roles, and permissions"
      loading={loading}
      error={error}
    >
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="user management tabs">
            <Tab label="Users" id="user-tab-0" aria-controls="user-tabpanel-0" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <UserList
            users={users}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            totalUsers={totalUsers}
            filters={filters}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onFiltersChange={handleFiltersChange}
            onCreateUser={handleCreateUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onActivateUser={handleActivateUser}
            onDeactivateUser={handleDeactivateUser}
            onChangeUserRole={handleChangeUserRole}
          />
        </TabPanel>
      </Paper>

      {showUserForm && (
        <UserForm
          open={showUserForm}
          user={selectedUser}
          onClose={handleCloseUserForm}
          onSave={handleUserSaved}
        />
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default Users;