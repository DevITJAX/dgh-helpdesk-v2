import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import PageLayout from '../../components/common/PageLayout';

const Profile = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    officeLocation: '',
    department: ''
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.displayName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        officeLocation: user.officeLocation || '',
        department: user.department || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      fullName: user.fullName || user.displayName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      officeLocation: user.officeLocation || '',
      department: user.department || ''
    });
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!user?.userId && !user?.id) {
      setError('User information not available');
      return;
    }

    // Basic validation
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await userService.updateProfile(formData, user.id);
      console.log('Profile updated successfully:', updatedUser);
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Update the auth context with new user data
      updateUser(updatedUser);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <PageLayout
        title="User Profile"
        error="Please log in to view your profile."
      >
        <Box />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="User Profile"
      loading={loading}
      error={error}
      success={success}
      actions={
        !isEditing ? (
          <Button
            startIcon={<EditIcon />}
            onClick={handleEdit}
            variant="outlined"
          >
            Edit Profile
          </Button>
        ) : (
          <Box>
            <Button
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              variant="contained"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )
      }
    >
      <Grid container spacing={3}>
        {/* User Information Card */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={3}>
              Personal Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Office Location"
                  name="officeLocation"
                  value={formData.officeLocation}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* User Summary Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Username
                </Typography>
                <Typography variant="body1">
                  {user?.username || user?.ldapUsername || 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Role
                </Typography>
                <Chip 
                  label={user?.role || 'N/A'} 
                  color={user?.role === 'ADMIN' ? 'error' : user?.role === 'TECHNICIAN' ? 'warning' : 'default'}
                  size="small"
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  User ID
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  {user?.userId || user?.id || 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Account Status
                </Typography>
                <Chip 
                  label={user?.isActive ? 'Active' : 'Inactive'} 
                  color={user?.isActive ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default Profile; 