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
import EquipmentList from './components/EquipmentList';
import EquipmentStatistics from './components/EquipmentStatistics';
import EquipmentForm from './components/EquipmentForm';
import NetworkDiscovery from './components/NetworkDiscovery';
import { equipmentService } from '../../services/equipmentService';
import { useAuth } from '../../contexts/AuthContext';
import PageLayout from '../../components/common/PageLayout';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`equipment-tabpanel-${index}`}
      aria-labelledby={`equipment-tab-${index}`}
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

const Equipment = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);

  // Pagination and filtering state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalEquipment, setTotalEquipment] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    equipmentType: '',
    status: '',
    location: '',
    isManaged: null
  });

  const loadEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        size: rowsPerPage,
        sortBy: 'hostname',
        sortDir: 'asc',
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await equipmentService.getAllEquipment(params);
      
      if (response.content) {
        // Paginated response
        setEquipment(response.content);
        setTotalEquipment(response.totalElements);
      } else if (Array.isArray(response)) {
        // Direct array response
        setEquipment(response);
        setTotalEquipment(response.length);
      } else {
        setEquipment([]);
        setTotalEquipment(0);
      }
    } catch (err) {
      console.error('Error loading equipment:', err);
      setError('Failed to load equipment. Please try again.');
      setEquipment([]);
      setTotalEquipment(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  const loadStatistics = useCallback(async () => {
    try {
      const stats = await equipmentService.getEquipmentStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error loading equipment statistics:', err);
    }
  }, []);

  useEffect(() => {
    loadEquipment();
    loadStatistics();
  }, [loadEquipment, loadStatistics]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateEquipment = () => {
    setSelectedEquipment(null);
    setShowEquipmentForm(true);
  };

  const handleEditEquipment = (equipment) => {
    setSelectedEquipment(equipment);
    setShowEquipmentForm(true);
  };

  const handleCloseEquipmentForm = () => {
    setShowEquipmentForm(false);
    setSelectedEquipment(null);
  };

  const handleEquipmentSaved = async (savedEquipment) => {
    setShowEquipmentForm(false);
    setSelectedEquipment(null);
    setSuccess(selectedEquipment ? 'Equipment updated successfully!' : 'Equipment created successfully!');
    await loadEquipment();
    await loadStatistics();
  };

  const handleDeleteEquipment = async (equipmentId) => {
    try {
      await equipmentService.deleteEquipment(equipmentId);
      setSuccess('Equipment deleted successfully!');
      await loadEquipment();
      await loadStatistics();
    } catch (err) {
      console.error('Error deleting equipment:', err);
      setError('Failed to delete equipment. Please try again.');
    }
  };

  const handleUpdateStatus = async (equipmentId, newStatus) => {
    try {
      await equipmentService.updateEquipmentStatus(equipmentId, newStatus);
      setSuccess('Equipment status updated successfully!');
      await loadEquipment();
      await loadStatistics();
    } catch (err) {
      console.error('Error updating equipment status:', err);
      setError('Failed to update equipment status. Please try again.');
    }
  };

  const handleMarkAsManaged = async (equipmentId) => {
    try {
      await equipmentService.markAsManaged(equipmentId);
      setSuccess('Equipment marked as managed successfully!');
      await loadEquipment();
      await loadStatistics();
    } catch (err) {
      console.error('Error marking equipment as managed:', err);
      setError('Failed to mark equipment as managed. Please try again.');
    }
  };

  const handleMarkAsUnmanaged = async (equipmentId) => {
    try {
      await equipmentService.markAsUnmanaged(equipmentId);
      setSuccess('Equipment marked as unmanaged successfully!');
      await loadEquipment();
      await loadStatistics();
    } catch (err) {
      console.error('Error marking equipment as unmanaged:', err);
      setError('Failed to mark equipment as unmanaged. Please try again.');
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

  const handleDiscoveryComplete = async () => {
    setSuccess('Network discovery completed successfully!');
    await loadEquipment();
    await loadStatistics();
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <PageLayout
      title="Equipment Management"
      subtitle="Manage IT equipment inventory, network discovery, and asset tracking"
      loading={loading}
      error={error}
    >
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="equipment management tabs">
            <Tab label="Equipment" id="equipment-tab-0" aria-controls="equipment-tabpanel-0" />
            <Tab label="Statistics" id="equipment-tab-1" aria-controls="equipment-tabpanel-1" />
            <Tab label="Network Discovery" id="equipment-tab-2" aria-controls="equipment-tabpanel-2" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <EquipmentList
            equipment={equipment}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            totalEquipment={totalEquipment}
            filters={filters}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onFiltersChange={handleFiltersChange}
            onCreateEquipment={handleCreateEquipment}
            onEditEquipment={handleEditEquipment}
            onDeleteEquipment={handleDeleteEquipment}
            onUpdateStatus={handleUpdateStatus}
            onMarkAsManaged={handleMarkAsManaged}
            onMarkAsUnmanaged={handleMarkAsUnmanaged}
            userRole={user?.role}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <EquipmentStatistics statistics={statistics} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <NetworkDiscovery onDiscoveryComplete={handleDiscoveryComplete} />
        </TabPanel>
      </Paper>

      {showEquipmentForm && (
        <EquipmentForm
          open={showEquipmentForm}
          equipment={selectedEquipment}
          onClose={handleCloseEquipmentForm}
          onSave={handleEquipmentSaved}
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

export default Equipment;