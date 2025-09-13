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
import { equipmentService } from '../../../services/equipmentService';

const EquipmentForm = ({ open, equipment, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    hostname: '',
    ipAddress: '',
    macAddress: '',
    equipmentType: 'UNKNOWN',
    manufacturer: '',
    model: '',
    serialNumber: '',
    osName: '',
    osVersion: '',
    location: '',
    status: 'UNKNOWN',
    isManaged: false,
    assetTag: '',
    cpuInfo: '',
    memoryGb: '',
    diskGb: '',
    networkPorts: '',
    specifications: '',
    purchaseDate: null,
    warrantyExpiry: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Equipment types and statuses
  const equipmentTypes = [
    { value: 'DESKTOP', label: 'Desktop Computer' },
    { value: 'LAPTOP', label: 'Laptop Computer' },
    { value: 'SERVER', label: 'Server' },
    { value: 'PRINTER', label: 'Printer' },
    { value: 'SWITCH', label: 'Network Switch' },
    { value: 'ROUTER', label: 'Router' },
    { value: 'ACCESS_POINT', label: 'Access Point' },
    { value: 'FIREWALL', label: 'Firewall' },
    { value: 'UPS', label: 'UPS' },
    { value: 'SCANNER', label: 'Scanner' },
    { value: 'PROJECTOR', label: 'Projector' },
    { value: 'PHONE', label: 'IP Phone' },
    { value: 'MONITOR', label: 'Monitor' },
    { value: 'STORAGE', label: 'Storage Device' },
    { value: 'UNKNOWN', label: 'Unknown' }
  ];

  const statusOptions = [
    { value: 'ONLINE', label: 'Online' },
    { value: 'OFFLINE', label: 'Offline' },
    { value: 'MAINTENANCE', label: 'Under Maintenance' },
    { value: 'RETIRED', label: 'Retired' },
    { value: 'UNKNOWN', label: 'Unknown' }
  ];

  // Common locations for Moroccan government buildings
  const commonLocations = [
    'Rabat - Ministère Principal',
    'Rabat - Annexe Administrative',
    'Casablanca - Direction Régionale',
    'Fès - Direction Régionale',
    'Marrakech - Direction Régionale',
    'Tanger - Direction Régionale',
    'Agadir - Direction Régionale',
    'Oujda - Direction Régionale',
    'Meknès - Bureau Régional',
    'Tétouan - Bureau Régional',
    'Salle Serveurs Principal',
    'Salle Serveurs Secondaire',
    'Centre de Données',
    'Bureau Direction',
    'Secrétariat',
    'Salle de Réunion',
    'Accueil',
    'Archives'
  ];

  useEffect(() => {
    if (equipment) {
      setFormData({
        hostname: equipment.hostname || '',
        ipAddress: equipment.ipAddress || '',
        macAddress: equipment.macAddress || '',
        equipmentType: equipment.equipmentType || 'UNKNOWN',
        manufacturer: equipment.manufacturer || '',
        model: equipment.model || '',
        serialNumber: equipment.serialNumber || '',
        osName: equipment.osName || '',
        osVersion: equipment.osVersion || '',
        location: equipment.location || '',
        status: equipment.status || 'UNKNOWN',
        isManaged: equipment.isManaged !== undefined ? equipment.isManaged : false,
        assetTag: equipment.assetTag || '',
        cpuInfo: equipment.cpuInfo || '',
        memoryGb: equipment.memoryGb || '',
        diskGb: equipment.diskGb || '',
        networkPorts: equipment.networkPorts || '',
        specifications: equipment.specifications || '',
        purchaseDate: equipment.purchaseDate ? new Date(equipment.purchaseDate) : null,
        warrantyExpiry: equipment.warrantyExpiry ? new Date(equipment.warrantyExpiry) : null
      });
    } else {
      setFormData({
        hostname: '',
        ipAddress: '',
        macAddress: '',
        equipmentType: 'UNKNOWN',
        manufacturer: '',
        model: '',
        serialNumber: '',
        osName: '',
        osVersion: '',
        location: '',
        status: 'UNKNOWN',
        isManaged: false,
        assetTag: '',
        cpuInfo: '',
        memoryGb: '',
        diskGb: '',
        networkPorts: '',
        specifications: '',
        purchaseDate: null,
        warrantyExpiry: null
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [equipment, open]);

  const handleChange = (field) => (event) => {
    const value = field === 'isManaged' ? event.target.checked : event.target.value;
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

  const handleDateChange = (field) => (date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // IP Address validation
    if (formData.ipAddress) {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(formData.ipAddress)) {
        newErrors.ipAddress = 'Please enter a valid IP address';
      }
    }

    // MAC Address validation
    if (formData.macAddress) {
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      if (!macRegex.test(formData.macAddress)) {
        newErrors.macAddress = 'Please enter a valid MAC address (e.g., 00:11:22:33:44:55)';
      }
    }

    // Length validations
    if (formData.hostname && formData.hostname.length > 255) {
      newErrors.hostname = 'Hostname must not exceed 255 characters';
    }

    if (formData.manufacturer && formData.manufacturer.length > 100) {
      newErrors.manufacturer = 'Manufacturer must not exceed 100 characters';
    }

    if (formData.model && formData.model.length > 100) {
      newErrors.model = 'Model must not exceed 100 characters';
    }

    if (formData.serialNumber && formData.serialNumber.length > 100) {
      newErrors.serialNumber = 'Serial number must not exceed 100 characters';
    }

    if (formData.osName && formData.osName.length > 100) {
      newErrors.osName = 'OS name must not exceed 100 characters';
    }

    if (formData.osVersion && formData.osVersion.length > 100) {
      newErrors.osVersion = 'OS version must not exceed 100 characters';
    }

    if (formData.location && formData.location.length > 255) {
      newErrors.location = 'Location must not exceed 255 characters';
    }

    if (formData.assetTag && formData.assetTag.length > 50) {
      newErrors.assetTag = 'Asset tag must not exceed 50 characters';
    }

    if (formData.cpuInfo && formData.cpuInfo.length > 255) {
      newErrors.cpuInfo = 'CPU info must not exceed 255 characters';
    }

    // Numeric validations
    if (formData.memoryGb && (isNaN(formData.memoryGb) || formData.memoryGb < 0)) {
      newErrors.memoryGb = 'Memory must be a positive number';
    }

    if (formData.diskGb && (isNaN(formData.diskGb) || formData.diskGb < 0)) {
      newErrors.diskGb = 'Disk space must be a positive number';
    }

    if (formData.networkPorts && (isNaN(formData.networkPorts) || formData.networkPorts < 0)) {
      newErrors.networkPorts = 'Network ports must be a positive number';
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
      // Prepare data for submission
      const submitData = {
        ...formData,
        memoryGb: formData.memoryGb ? parseInt(formData.memoryGb) : null,
        diskGb: formData.diskGb ? parseInt(formData.diskGb) : null,
        networkPorts: formData.networkPorts ? parseInt(formData.networkPorts) : null,
        purchaseDate: formData.purchaseDate ? formData.purchaseDate.toISOString() : null,
        warrantyExpiry: formData.warrantyExpiry ? formData.warrantyExpiry.toISOString() : null
      };

      // Remove empty strings
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          submitData[key] = null;
        }
      });

      let savedEquipment;
      if (equipment) {
        // Update existing equipment
        savedEquipment = await equipmentService.updateEquipment(equipment.id, submitData);
      } else {
        // Create new equipment
        savedEquipment = await equipmentService.createEquipment(submitData);
      }
      
      onSave(savedEquipment);
    } catch (error) {
      console.error('Error saving equipment:', error);
      
      if (error.response?.status === 400) {
        setSubmitError('Invalid data provided. Please check your inputs.');
      } else if (error.response?.status === 409) {
        setSubmitError('Equipment with this IP address or MAC address already exists.');
      } else {
        setSubmitError('Failed to save equipment. Please try again.');
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
      maxWidth="lg"
      fullWidth
      aria-labelledby="equipment-form-dialog-title"
    >
        <DialogTitle id="equipment-form-dialog-title">
          {equipment ? 'Edit Equipment' : 'Add New Equipment'}
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
                  label="Hostname"
                  value={formData.hostname}
                  onChange={handleChange('hostname')}
                  error={!!errors.hostname}
                  helperText={errors.hostname}
                  placeholder="e.g., PC-ADMIN-01"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="IP Address"
                  value={formData.ipAddress}
                  onChange={handleChange('ipAddress')}
                  error={!!errors.ipAddress}
                  helperText={errors.ipAddress}
                  placeholder="e.g., 192.168.1.100"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="MAC Address"
                  value={formData.macAddress}
                  onChange={handleChange('macAddress')}
                  error={!!errors.macAddress}
                  helperText={errors.macAddress}
                  placeholder="e.g., 00:11:22:33:44:55"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Equipment Type</InputLabel>
                  <Select
                    value={formData.equipmentType}
                    label="Equipment Type"
                    onChange={handleChange('equipmentType')}
                  >
                    {equipmentTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Hardware Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Hardware Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange('manufacturer')}
                  error={!!errors.manufacturer}
                  helperText={errors.manufacturer}
                  placeholder="e.g., Dell, HP, Cisco"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Model"
                  value={formData.model}
                  onChange={handleChange('model')}
                  error={!!errors.model}
                  helperText={errors.model}
                  placeholder="e.g., OptiPlex 7090"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Serial Number"
                  value={formData.serialNumber}
                  onChange={handleChange('serialNumber')}
                  error={!!errors.serialNumber}
                  helperText={errors.serialNumber}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Asset Tag"
                  value={formData.assetTag}
                  onChange={handleChange('assetTag')}
                  error={!!errors.assetTag}
                  helperText={errors.assetTag}
                  placeholder="Internal asset tracking number"
                />
              </Grid>

              {/* System Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  System Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Operating System"
                  value={formData.osName}
                  onChange={handleChange('osName')}
                  error={!!errors.osName}
                  helperText={errors.osName}
                  placeholder="e.g., Windows 11, Ubuntu"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="OS Version"
                  value={formData.osVersion}
                  onChange={handleChange('osVersion')}
                  error={!!errors.osVersion}
                  helperText={errors.osVersion}
                  placeholder="e.g., 22H2, 20.04 LTS"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="CPU Information"
                  value={formData.cpuInfo}
                  onChange={handleChange('cpuInfo')}
                  error={!!errors.cpuInfo}
                  helperText={errors.cpuInfo}
                  placeholder="e.g., Intel Core i7-11700 @ 2.50GHz"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Memory (GB)"
                  type="number"
                  value={formData.memoryGb}
                  onChange={handleChange('memoryGb')}
                  error={!!errors.memoryGb}
                  helperText={errors.memoryGb}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Disk Space (GB)"
                  type="number"
                  value={formData.diskGb}
                  onChange={handleChange('diskGb')}
                  error={!!errors.diskGb}
                  helperText={errors.diskGb}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Network Ports"
                  type="number"
                  value={formData.networkPorts}
                  onChange={handleChange('networkPorts')}
                  error={!!errors.networkPorts}
                  helperText={errors.networkPorts}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              {/* Location and Status */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Location and Status
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={formData.location}
                    label="Location"
                    onChange={handleChange('location')}
                  >
                    <MenuItem value="">
                      <em>Select Location</em>
                    </MenuItem>
                    {commonLocations.map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={handleChange('status')}
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isManaged}
                      onChange={handleChange('isManaged')}
                      color="primary"
                    />
                  }
                  label="Managed Equipment"
                />
              </Grid>

              {/* Purchase and Warranty */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Purchase and Warranty Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Purchase Date"
                  type="date"
                  value={formData.purchaseDate ? formData.purchaseDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('purchaseDate')(e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Warranty Expiry"
                  type="date"
                  value={formData.warrantyExpiry ? formData.warrantyExpiry.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('warrantyExpiry')(e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Specifications"
                  multiline
                  rows={3}
                  value={formData.specifications}
                  onChange={handleChange('specifications')}
                  placeholder="Additional technical specifications or notes..."
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
            {loading ? 'Saving...' : (equipment ? 'Update Equipment' : 'Add Equipment')}
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default EquipmentForm;