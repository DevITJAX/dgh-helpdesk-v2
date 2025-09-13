import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Computer as ComputerIcon,
  Router as RouterIcon,
  Print as PrintIcon,
  Storage as StorageIcon,
  PhoneAndroid as PhoneIcon,
  Monitor as MonitorIcon,
  Scanner as ScannerIcon,
  Videocam as ProjectorIcon,
  Security as FirewallIcon,
  PowerSettingsNew as UpsIcon,
  DeviceHub as SwitchIcon,
  Wifi as AccessPointIcon,
  HelpOutline as UnknownIcon,
  CheckCircle as OnlineIcon,
  Cancel as OfflineIcon,
  Build as MaintenanceIcon,
  Archive as RetiredIcon,
  QuestionMark as UnknownStatusIcon,
  Settings as ManageIcon,
  SettingsInputComponent as UnmanageIcon
} from '@mui/icons-material';
import EnhancedPagination from '../../../components/common/EnhancedPagination';
import EnhancedFilters from '../../../components/common/EnhancedFilters';

const EquipmentList = ({
  equipment,
  loading,
  page,
  rowsPerPage,
  totalEquipment,
  filters,
  onPageChange,
  onRowsPerPageChange,
  onFiltersChange,
  onCreateEquipment,
  onEditEquipment,
  onDeleteEquipment,
  onUpdateStatus,
  onMarkAsManaged,
  onMarkAsUnmanaged,
  userRole
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);

  const handleMenuOpen = (event, equipment) => {
    setAnchorEl(event.currentTarget);
    setSelectedEquipment(equipment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEquipment(null);
  };

  const handleDeleteClick = (equipment) => {
    setEquipmentToDelete(equipment);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (equipmentToDelete) {
      onDeleteEquipment(equipmentToDelete.id);
    }
    setDeleteDialogOpen(false);
    setEquipmentToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEquipmentToDelete(null);
  };

  const handleStatusChange = (newStatus) => {
    if (selectedEquipment) {
      onUpdateStatus(selectedEquipment.id, newStatus);
    }
    handleMenuClose();
  };

  const handleMarkAsManaged = () => {
    if (selectedEquipment) {
      onMarkAsManaged(selectedEquipment.id);
    }
    handleMenuClose();
  };

  const handleMarkAsUnmanaged = () => {
    if (selectedEquipment) {
      onMarkAsUnmanaged(selectedEquipment.id);
    }
    handleMenuClose();
  };

  const getEquipmentIcon = (type) => {
    switch (type) {
      case 'COMPUTER':
        return <ComputerIcon />;
      case 'ROUTER':
        return <RouterIcon />;
      case 'PRINTER':
        return <PrintIcon />;
      case 'STORAGE':
        return <StorageIcon />;
      case 'MOBILE':
        return <PhoneIcon />;
      case 'MONITOR':
        return <MonitorIcon />;
      case 'SCANNER':
        return <ScannerIcon />;
      case 'PROJECTOR':
        return <ProjectorIcon />;
      case 'FIREWALL':
        return <FirewallIcon />;
      case 'UPS':
        return <UpsIcon />;
      case 'SWITCH':
        return <SwitchIcon />;
      case 'ACCESS_POINT':
        return <AccessPointIcon />;
      default:
        return <UnknownIcon />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ONLINE':
        return <OnlineIcon />;
      case 'OFFLINE':
        return <OfflineIcon />;
      case 'MAINTENANCE':
        return <MaintenanceIcon />;
      case 'RETIRED':
        return <RetiredIcon />;
      default:
        return <UnknownStatusIcon />;
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
      case 'RETIRED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getEquipmentDisplayName = (item) => {
    return item.hostname || item.ipAddress || item.macAddress || 'Unknown Equipment';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  // Filter configurations
  const filterConfigs = [
    {
      field: 'equipmentType',
      label: 'Equipment Type',
      type: 'select',
      options: [
        { value: 'COMPUTER', label: 'Computer' },
        { value: 'ROUTER', label: 'Router' },
        { value: 'PRINTER', label: 'Printer' },
        { value: 'STORAGE', label: 'Storage' },
        { value: 'MOBILE', label: 'Mobile Device' },
        { value: 'MONITOR', label: 'Monitor' },
        { value: 'SCANNER', label: 'Scanner' },
        { value: 'PROJECTOR', label: 'Projector' },
        { value: 'FIREWALL', label: 'Firewall' },
        { value: 'UPS', label: 'UPS' },
        { value: 'SWITCH', label: 'Switch' },
        { value: 'ACCESS_POINT', label: 'Access Point' }
      ]
    },
    {
      field: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'ONLINE', label: 'Online' },
        { value: 'OFFLINE', label: 'Offline' },
        { value: 'MAINTENANCE', label: 'Maintenance' },
        { value: 'RETIRED', label: 'Retired' }
      ]
    },
    {
      field: 'location',
      label: 'Location',
      type: 'text'
    },
    {
      field: 'isManaged',
      label: 'Management',
      type: 'select',
      options: [
        { value: 'true', label: 'Managed' },
        { value: 'false', label: 'Unmanaged' }
      ]
    }
  ];

  return (
    <Box>
      {/* Enhanced Filters */}
      <EnhancedFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        filterConfigs={filterConfigs}
        loading={loading}
        searchPlaceholder="Search equipment by hostname, IP, or MAC address..."
      />

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Equipment ({totalEquipment})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateEquipment}
          disabled={loading}
        >
          Add Equipment
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Equipment</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Managed</TableCell>
              <TableCell>Last Seen</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading equipment...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : equipment.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No equipment found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              equipment.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                        {getEquipmentIcon(item.equipmentType)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {getEquipmentDisplayName(item)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.ipAddress}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.macAddress}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getEquipmentIcon(item.equipmentType)}
                      label={item.equipmentType?.replace('_', ' ') || 'UNKNOWN'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(item.status)}
                      label={item.status || 'UNKNOWN'}
                      color={getStatusColor(item.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.location || 'Not specified'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={item.isManaged ? <ManageIcon /> : <UnmanageIcon />}
                      label={item.isManaged ? 'Managed' : 'Unmanaged'}
                      color={item.isManaged ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(item.lastSeenAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, item)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Enhanced Pagination */}
      <EnhancedPagination
        count={totalEquipment}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        loading={loading}
        showInfo={true}
        showPageSizeSelector={true}
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        <MenuItem onClick={() => onEditEquipment(selectedEquipment)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Equipment</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => handleStatusChange('ONLINE')}>
          <ListItemIcon>
            <OnlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Online</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleStatusChange('OFFLINE')}>
          <ListItemIcon>
            <OfflineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Offline</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleStatusChange('MAINTENANCE')}>
          <ListItemIcon>
            <MaintenanceIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Maintenance</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleStatusChange('RETIRED')}>
          <ListItemIcon>
            <RetiredIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Retired</ListItemText>
        </MenuItem>
        
        <Divider />
        
        {selectedEquipment?.isManaged ? (
          <MenuItem onClick={handleMarkAsUnmanaged}>
            <ListItemIcon>
              <UnmanageIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Unmanaged</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={handleMarkAsManaged}>
            <ListItemIcon>
              <ManageIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Managed</ListItemText>
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={() => handleDeleteClick(selectedEquipment)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Equipment</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Equipment
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete equipment "{equipmentToDelete?.hostname}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentList;