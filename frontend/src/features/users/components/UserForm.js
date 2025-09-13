import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { userService } from '../../../services/userService';

const UserForm = ({ open, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    ldapUsername: '',
    email: '',
    fullName: '',
    department: '',
    role: 'EMPLOYEE',
    isActive: true,
    phoneNumber: '',
    officeLocation: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Common departments for the Moroccan Ministry of Equipment and Water
  const departments = [
    'Direction Générale de l\'Hydraulique',
    'Direction des Ressources en Eau',
    'Direction de l\'Assainissement',
    'Direction de l\'Équipement',
    'Direction des Routes',
    'Direction des Ports',
    'Direction de l\'Aviation Civile',
    'Direction de la Météorologie',
    'Secrétariat Général',
    'Direction des Affaires Juridiques',
    'Direction des Ressources Humaines',
    'Direction du Budget et des Finances',
    'Direction des Systèmes d\'Information',
    'Direction de la Coopération',
    'Inspection Générale'
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        ldapUsername: user.ldapUsername || '',
        email: user.email || '',
        fullName: user.fullName || '',
        department: user.department || '',
        role: user.role || 'EMPLOYEE',
        isActive: user.isActive !== undefined ? user.isActive : true,
        phoneNumber: user.phoneNumber || '',
        officeLocation: user.officeLocation || ''
      });
    } else {
      setFormData({
        ldapUsername: '',
        email: '',
        fullName: '',
        department: '',
        role: 'EMPLOYEE',
        isActive: true,
        phoneNumber: '',
        officeLocation: ''
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [user, open]);

  const handleChange = (field) => (event) => {
    const value = field === 'isActive' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.ldapUsername.trim()) {
      newErrors.ldapUsername = 'LDAP username is required';
    } else if (formData.ldapUsername.length > 100) {
      newErrors.ldapUsername = 'LDAP username must not exceed 100 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 255) {
      newErrors.email = 'Email must not exceed 255 characters';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length > 255) {
      newErrors.fullName = 'Full name must not exceed 255 characters';
    }

    // Optional field validations
    if (formData.department && formData.department.length > 100) {
      newErrors.department = 'Department must not exceed 100 characters';
    }

    if (formData.phoneNumber && formData.phoneNumber.length > 20) {
      newErrors.phoneNumber = 'Phone number must not exceed 20 characters';
    }

    if (formData.officeLocation && formData.officeLocation.length > 100) {
      newErrors.officeLocation = 'Office location must not exceed 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      let savedUser;
      if (user) {
        // Update existing user
        savedUser = await userService.updateUser(user.id, formData);
      } else {
        // Create new user
        savedUser = await userService.createUser(formData);
      }
      
      onSave(savedUser);
    } catch (error) {
      console.error('Error saving user:', error);
      
      if (error.response?.status === 400) {
        setSubmitError('Invalid data provided. Please check your inputs.');
      } else if (error.response?.status === 409) {
        setSubmitError('A user with this username or email already exists.');
      } else {
        setSubmitError('Failed to save user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="user-form-dialog-title"
    >
      <DialogTitle id="user-form-dialog-title">
        {user ? 'Edit User' : 'Create New User'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="LDAP Username"
                value={formData.ldapUsername}
                onChange={handleChange('ldapUsername')}
                error={!!errors.ldapUsername}
                helperText={errors.ldapUsername}
                required
                disabled={!!user} // Don't allow changing username for existing users
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                error={!!errors.fullName}
                helperText={errors.fullName}
                required
              />
            </Grid>

            {/* Role and Status */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Role and Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={handleChange('role')}
                >
                  <MenuItem value="EMPLOYEE">Employee</MenuItem>
                  <MenuItem value="TECHNICIAN">Technician</MenuItem>
                  <MenuItem value="ADMIN">Administrator</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange('isActive')}
                    color="primary"
                  />
                }
                label="Active User"
              />
            </Grid>

            {/* Department and Contact */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Department and Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  label="Department"
                  onChange={handleChange('department')}
                >
                  <MenuItem value="">
                    <em>Select Department</em>
                  </MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange('phoneNumber')}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                placeholder="+212 6XX XXX XXX"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Office Location"
                value={formData.officeLocation}
                onChange={handleChange('officeLocation')}
                error={!!errors.officeLocation}
                helperText={errors.officeLocation}
                placeholder="Building, Floor, Room"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;