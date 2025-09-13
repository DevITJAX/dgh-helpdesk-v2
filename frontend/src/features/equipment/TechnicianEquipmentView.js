import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  Computer,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  NetworkCheck as NetworkCheckIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { equipmentService } from '../../services/equipmentService';
import { TECHNICIAN_EQUIPMENT_PERMISSIONS } from '../../constants/technicianPermissions';

const TechnicianEquipmentView = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'view', 'edit', 'maintenance', 'note'
  const [tabValue, setTabValue] = useState(0); // 0: All Equipment, 1: Maintenance, 2: Alerts
  const [formData, setFormData] = useState({
    status: '',
    location: '',
    notes: ''
  });
  const [maintenanceData, setMaintenanceData] = useState({
    reason: '',
    scheduledDate: '',
    notes: ''
  });
  const [noteData, setNoteData] = useState({
    note: '',
    type: 'MAINTENANCE'
  });

  const loadEquipmentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get equipment for the technician's area
      const data = await equipmentService.getEquipmentByTechnicianArea(user?.userId || user?.id);
      setEquipment(data);
    } catch (err) {
      console.error('Error loading equipment data:', err);
      setError('Failed to load equipment data');
    } finally {
      setLoading(false);
    }
  };

  // Load equipment data when component mounts or user changes
  useEffect(() => {
    if (user?.userId || user?.id) {
      loadEquipmentData();
    }
  }, [user?.userId, user?.id]);

  const handleDialogOpen = (type, equipment = null) => {
    setDialogType(type);
    setSelectedEquipment(equipment);
    if (equipment && type === 'edit') {
      setFormData({
        status: equipment.status || '',
        location: equipment.location || '',
        notes: ''
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedEquipment(null);
    setFormData({ status: '', location: '', notes: '' });
    setMaintenanceData({ reason: '', scheduledDate: '', notes: '' });
    setNoteData({ note: '', type: 'MAINTENANCE' });
  };

  const handleUpdateEquipment = async () => {
    try {
      const updatedEquipment = await equipmentService.updateEquipment(selectedEquipment.id, formData);
      setEquipment(prev => prev.map(e => e.id === updatedEquipment.id ? updatedEquipment : e));
      handleDialogClose();
    } catch (err) {
      setError('Failed to update equipment');
      console.error('Update error:', err);
    }
  };

  const handleUpdateStatus = async (equipmentId, newStatus) => {
    try {
      const updatedEquipment = await equipmentService.updateEquipmentStatus(equipmentId, newStatus);
      setEquipment(prev => prev.map(e => e.id === updatedEquipment.id ? updatedEquipment : e));
    } catch (err) {
      setError('Failed to update equipment status');
      console.error('Status update error:', err);
    }
  };

  const handleAddMaintenanceNote = async () => {
    try {
      await equipmentService.addMaintenanceNote(selectedEquipment.id, {
        ...noteData,
        addedBy: user.id
      });
      handleDialogClose();
    } catch (err) {
      setError('Failed to add maintenance note');
      console.error('Note error:', err);
    }
  };

  const handleScheduleMaintenance = async () => {
    try {
      await equipmentService.scheduleMaintenance(selectedEquipment.id, {
        ...maintenanceData,
        scheduledBy: user.id
      });
      handleDialogClose();
    } catch (err) {
      setError('Failed to schedule maintenance');
      console.error('Maintenance error:', err);
    }
  };

  const handlePingEquipment = async (equipmentId) => {
    try {
      const result = await equipmentService.pingEquipment(equipmentId);
      // Show ping result in a toast or alert
      console.log('Ping result:', result);
    } catch (err) {
      setError('Failed to ping equipment');
      console.error('Ping error:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ONLINE':
        return 'success';
      case 'OFFLINE':
        return 'error';
      case 'MAINTENANCE':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ONLINE':
        return <CheckCircleIcon color="success" />;
      case 'OFFLINE':
        return <ErrorIcon color="error" />;
      case 'MAINTENANCE':
        return <BuildIcon color="warning" />;
      default:
        return <Computer />;
    }
  };

  const getEquipmentTypeIcon = (type) => {
    switch (type) {
      case 'SERVER':
        return <Computer />;
      case 'DESKTOP':
        return <Computer />;
      case 'LAPTOP':
        return <Computer />;
      case 'NETWORK_DEVICE':
        return <NetworkCheckIcon />;
      default:
        return <Computer />;
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Filter equipment based on tab
  const getFilteredEquipment = () => {
    switch (tabValue) {
      case 1: // Maintenance
        return equipment.filter(e => e.status === 'MAINTENANCE');
      case 2: // Alerts
        return equipment.filter(e => e.status === 'OFFLINE' || e.lastSeen === null);
      default: // All equipment
        return equipment;
    }
  };

  const filteredEquipment = getFilteredEquipment();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Equipment Management
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Manage equipment in your assigned area
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`All Equipment (${equipment.length})`} />
          <Tab label={`Maintenance (${equipment.filter(e => e.status === 'MAINTENANCE').length})`} />
          <Tab label={`Alerts (${equipment.filter(e => e.status === 'OFFLINE' || e.lastSeen === null).length})`} />
        </Tabs>
      </Box>

      {/* Equipment Grid */}
      <Grid container spacing={3}>
        {filteredEquipment.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getEquipmentTypeIcon(item.equipmentType)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {item.hostname}
                  </Typography>
                </Box>
                
                <Typography color="textSecondary" gutterBottom>
                  {item.ipAddress}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip
                    icon={getStatusIcon(item.status)}
                    label={item.status}
                    color={getStatusColor(item.status)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={item.equipmentType}
                    variant="outlined"
                    size="small"
                  />
                </Box>
                
                {item.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="textSecondary">
                      {item.location}
                    </Typography>
                  </Box>
                )}
                
                {item.lastSeen && (
                  <Typography variant="body2" color="textSecondary">
                    Last seen: {new Date(item.lastSeen).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions>
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={() => handleDialogOpen('view', item)}
                  >
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                
                {TECHNICIAN_EQUIPMENT_PERMISSIONS.updateEquipmentStatus && (
                  <Tooltip title="Update Status">
                    <IconButton
                      size="small"
                      onClick={() => handleDialogOpen('edit', item)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
                
                {TECHNICIAN_EQUIPMENT_PERMISSIONS.pingEquipment && (
                  <Tooltip title="Ping Equipment">
                    <IconButton
                      size="small"
                      onClick={() => handlePingEquipment(item.id)}
                    >
                      <NetworkCheckIcon />
                    </IconButton>
                  </Tooltip>
                )}
                
                {TECHNICIAN_EQUIPMENT_PERMISSIONS.addEquipmentNotes && (
                  <Tooltip title="Add Note">
                    <IconButton
                      size="small"
                      onClick={() => handleDialogOpen('note', item)}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                )}
                
                {TECHNICIAN_EQUIPMENT_PERMISSIONS.scheduleMaintenance && (
                  <Tooltip title="Schedule Maintenance">
                    <IconButton
                      size="small"
                      onClick={() => handleDialogOpen('maintenance', item)}
                    >
                      <ScheduleIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredEquipment.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No equipment found
          </Typography>
          <Typography color="textSecondary">
            {tabValue === 1 ? 'No equipment currently under maintenance.' :
             tabValue === 2 ? 'No equipment alerts at this time.' :
             'No equipment assigned to your area.'}
          </Typography>
        </Paper>
      )}

      {/* Dialogs */}
      
      {/* View Equipment Dialog */}
      <Dialog open={dialogOpen && dialogType === 'view'} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Equipment Details</DialogTitle>
        <DialogContent>
          {selectedEquipment && (
            <Box>
              <Typography variant="h6">{selectedEquipment.hostname}</Typography>
              <Typography color="textSecondary" gutterBottom>
                {selectedEquipment.ipAddress}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Chip 
                  icon={getStatusIcon(selectedEquipment.status)}
                  label={`Status: ${selectedEquipment.status}`} 
                  color={getStatusColor(selectedEquipment.status)}
                  sx={{ mr: 1 }} 
                />
                <Chip label={`Type: ${selectedEquipment.equipmentType}`} sx={{ mr: 1 }} />
                {selectedEquipment.location && (
                  <Chip label={`Location: ${selectedEquipment.location}`} />
                )}
              </Box>
              
              {selectedEquipment.description && (
                <Typography sx={{ mt: 2 }}>
                  {selectedEquipment.description}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Equipment Dialog */}
      <Dialog open={dialogOpen && dialogType === 'edit'} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Update Equipment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="ONLINE">Online</MenuItem>
                <MenuItem value="OFFLINE">Offline</MenuItem>
                <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              fullWidth
            />
            
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleUpdateEquipment} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={dialogOpen && dialogType === 'note'} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Add Maintenance Note</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Note Type</InputLabel>
              <Select
                value={noteData.type}
                onChange={(e) => setNoteData({ ...noteData, type: e.target.value })}
              >
                <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                <MenuItem value="REPAIR">Repair</MenuItem>
                <MenuItem value="INSPECTION">Inspection</MenuItem>
                <MenuItem value="GENERAL">General</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Note"
              value={noteData.note}
              onChange={(e) => setNoteData({ ...noteData, note: e.target.value })}
              multiline
              rows={4}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleAddMaintenanceNote} variant="contained">
            Add Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Maintenance Dialog */}
      <Dialog open={dialogOpen && dialogType === 'maintenance'} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Schedule Maintenance</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Reason for Maintenance"
              value={maintenanceData.reason}
              onChange={(e) => setMaintenanceData({ ...maintenanceData, reason: e.target.value })}
              fullWidth
              required
            />
            
            <TextField
              label="Scheduled Date"
              type="datetime-local"
              value={maintenanceData.scheduledDate}
              onChange={(e) => setMaintenanceData({ ...maintenanceData, scheduledDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <TextField
              label="Additional Notes"
              value={maintenanceData.notes}
              onChange={(e) => setMaintenanceData({ ...maintenanceData, notes: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleScheduleMaintenance} variant="contained">
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TechnicianEquipmentView; 