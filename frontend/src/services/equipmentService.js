import apiClient from './apiClient';

export const equipmentService = {
  getAllEquipment: async (params = {}) => {
    try {
      console.log('EquipmentService: Fetching all equipment with params:', params);
      const response = await apiClient.get('/api/equipment', { params });
      console.log('EquipmentService: All equipment response:', response.data);
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error fetching all equipment:', error);
      throw error;
    }
  },

  getEquipmentById: async (id) => {
    try {
      const response = await apiClient.get(`/api/equipment/${id}`);
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error fetching equipment by ID:', error);
      throw error;
    }
  },

  getEquipmentByType: async (equipmentType) => {
    try {
      const response = await apiClient.get(`/api/equipment/type/${equipmentType}`);
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error fetching equipment by type:', error);
      throw error;
    }
  },

  getEquipmentByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/api/equipment/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error fetching equipment by status:', error);
      throw error;
    }
  },

  getEquipmentByLocation: async (location) => {
    try {
      const response = await apiClient.get(`/api/equipment/location/${encodeURIComponent(location)}`);
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error fetching equipment by location:', error);
      throw error;
    }
  },

  getManagedEquipment: async () => {
    try {
      const response = await apiClient.get('/api/equipment/managed');
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error fetching managed equipment:', error);
      throw error;
    }
  },

  getUnmanagedEquipment: async () => {
    try {
      const response = await apiClient.get('/api/equipment/unmanaged');
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error fetching unmanaged equipment:', error);
      throw error;
    }
  },

  getEquipmentNotSeen: async (hours = 24) => {
    try {
      const response = await apiClient.get('/api/equipment/not-seen', {
        params: { hours }
      });
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error fetching equipment not seen:', error);
      throw error;
    }
  },

  getEquipmentWithExpiringWarranty: async (daysFromNow = 30) => {
    try {
      const response = await apiClient.get('/api/equipment/warranty-expiring', {
        params: { daysFromNow }
      });
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error fetching equipment with expiring warranty:', error);
      throw error;
    }
  },

  getDistinctLocations: async () => {
    try {
      const response = await apiClient.get('/api/equipment/locations');
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error fetching distinct locations:', error);
      throw error;
    }
  },

  getDistinctManufacturers: async () => {
    try {
      const response = await apiClient.get('/api/equipment/manufacturers');
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error fetching distinct manufacturers:', error);
      throw error;
    }
  },

  createEquipment: async (equipmentData) => {
    try {
      console.log('EquipmentService: Creating equipment:', equipmentData);
      const response = await apiClient.post('/api/equipment', equipmentData);
      console.log('EquipmentService: Equipment created:', response.data);
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error creating equipment:', error);
      throw error;
    }
  },

  updateEquipment: async (id, equipmentData) => {
    try {
      console.log('EquipmentService: Updating equipment:', id, equipmentData);
      const response = await apiClient.put(`/api/equipment/${id}`, equipmentData);
      console.log('EquipmentService: Equipment updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error updating equipment:', error);
      throw error;
    }
  },

  updateEquipmentStatus: async (id, status) => {
    try {
      const response = await apiClient.put(`/api/equipment/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error updating equipment status:', error);
      throw error;
    }
  },

  updateLastSeen: async (id) => {
    try {
      const response = await apiClient.put(`/api/equipment/${id}/last-seen`);
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error updating last seen:', error);
      throw error;
    }
  },

  markAsManaged: async (id) => {
    try {
      const response = await apiClient.put(`/api/equipment/${id}/manage`);
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error marking as managed:', error);
      throw error;
    }
  },

  markAsUnmanaged: async (id) => {
    try {
      const response = await apiClient.put(`/api/equipment/${id}/unmanage`);
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error marking as unmanaged:', error);
      throw error;
    }
  },

  deleteEquipment: async (id) => {
    try {
      console.log('EquipmentService: Deleting equipment:', id);
      const response = await apiClient.delete(`/api/equipment/${id}`);
      console.log('EquipmentService: Equipment deleted');
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error deleting equipment:', error);
      throw error;
    }
  },

  getEquipmentStatistics: async () => {
    try {
      // First try to get statistics from the backend API
      const response = await apiClient.get('/api/equipment/statistics');
      const apiStats = response.data;
      
      // Check if the API returned meaningful data
      if (apiStats && apiStats.totalEquipment > 0) {
        console.log('EquipmentService: Using API statistics:', apiStats);
        // Map backend field names to frontend expected names
        return {
          totalEquipment: apiStats.totalEquipment,
          onlineCount: apiStats.onlineEquipment,
          offlineCount: apiStats.offlineEquipment,
          managedCount: apiStats.managedEquipment,
          unmanagedCount: apiStats.totalEquipment - apiStats.managedEquipment,
          typeDistribution: {},
          statusDistribution: {},
          locationDistribution: {},
          manufacturerDistribution: {}
        };
      }
      
      // Fallback: Calculate statistics from actual equipment data
      console.log('EquipmentService: API returned empty/mock data, calculating from equipment list...');
      const allEquipmentResponse = await apiClient.get('/api/equipment');
      const allEquipment = allEquipmentResponse.data.content || allEquipmentResponse.data || [];
      
      // Calculate real statistics
      const totalEquipment = allEquipment.length;
      const onlineCount = allEquipment.filter(equipment => equipment.status === 'ONLINE').length;
      const offlineCount = allEquipment.filter(equipment => equipment.status === 'OFFLINE').length;
      const managedCount = allEquipment.filter(equipment => equipment.isManaged === true).length;
      const unmanagedCount = totalEquipment - managedCount;
      
      // Calculate type distribution
      const typeCounts = {};
      allEquipment.forEach(equipment => {
        if (equipment.equipmentType) {
          typeCounts[equipment.equipmentType] = (typeCounts[equipment.equipmentType] || 0) + 1;
        }
      });
      
      // Calculate status distribution
      const statusCounts = {};
      allEquipment.forEach(equipment => {
        if (equipment.status) {
          statusCounts[equipment.status] = (statusCounts[equipment.status] || 0) + 1;
        }
      });
      
      // Calculate location distribution
      const locationCounts = {};
      allEquipment.forEach(equipment => {
        if (equipment.location) {
          locationCounts[equipment.location] = (locationCounts[equipment.location] || 0) + 1;
        }
      });
      
      // Calculate manufacturer distribution
      const manufacturerCounts = {};
      allEquipment.forEach(equipment => {
        if (equipment.manufacturer) {
          manufacturerCounts[equipment.manufacturer] = (manufacturerCounts[equipment.manufacturer] || 0) + 1;
        }
      });
      
      const calculatedStats = {
        totalEquipment,
        onlineCount,
        offlineCount,
        managedCount,
        unmanagedCount,
        typeDistribution: typeCounts,
        statusDistribution: statusCounts,
        locationDistribution: locationCounts,
        manufacturerDistribution: manufacturerCounts
      };
      
      console.log('EquipmentService: Calculated statistics:', calculatedStats);
      return calculatedStats;
      
    } catch (error) {
      console.error('EquipmentService: Error fetching equipment statistics:', error);
      
      // Final fallback: return basic structure with zeros
      return {
        totalEquipment: 0,
        onlineCount: 0,
        offlineCount: 0,
        managedCount: 0,
        unmanagedCount: 0,
        typeDistribution: {},
        statusDistribution: {},
        locationDistribution: {},
        manufacturerDistribution: {}
      };
    }
  },

  createFromDiscovery: async (discoveryData) => {
    try {
      console.log('EquipmentService: Creating equipment from discovery:', discoveryData);
      const response = await apiClient.post('/api/equipment/discovery', discoveryData);
      console.log('EquipmentService: Equipment created from discovery:', response.data);
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error creating equipment from discovery:', error);
      throw error;
    }
  },

  searchEquipment: async (searchTerm) => {
    try {
      const response = await apiClient.get('/api/equipment', {
        params: { search: searchTerm }
      });
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error searching equipment:', error);
      throw error;
    }
  },

  // ===== NEW TECHNICIAN-SPECIFIC METHODS =====

  // Add maintenance note to equipment
  addMaintenanceNote: async (equipmentId, noteData) => {
    try {
      const response = await apiClient.post(`/api/equipment/${equipmentId}/maintenance-notes`, {
        ...noteData,
        addedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error adding maintenance note:', error);
      throw error;
    }
  },

  // Get maintenance notes for equipment
  getMaintenanceNotes: async (equipmentId) => {
    try {
      const response = await apiClient.get(`/api/equipment/${equipmentId}/maintenance-notes`);
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error fetching maintenance notes:', error);
      throw error;
    }
  },

  // Update equipment location
  updateEquipmentLocation: async (equipmentId, location) => {
    try {
      const response = await apiClient.put(`/api/equipment/${equipmentId}/location`, { location });
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error updating equipment location:', error);
      throw error;
    }
  },

  // Mark equipment for maintenance
  markForMaintenance: async (equipmentId, maintenanceData) => {
    try {
      const response = await apiClient.put(`/api/equipment/${equipmentId}/maintenance`, {
        ...maintenanceData,
        markedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error marking equipment for maintenance:', error);
      throw error;
    }
  },

  // Ping equipment for connectivity test
  pingEquipment: async (equipmentId) => {
    try {
      const response = await apiClient.post(`/api/equipment/${equipmentId}/ping`);
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error pinging equipment:', error);
      throw error;
    }
  },

  // Get detailed equipment information (SNMP data)
  getEquipmentDetails: async (equipmentId) => {
    try {
      const response = await apiClient.get(`/api/equipment/${equipmentId}/details`);
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error fetching equipment details:', error);
      throw error;
    }
  },

  // Create maintenance ticket for equipment
  createMaintenanceTicket: async (equipmentId, ticketData) => {
    try {
      const response = await apiClient.post(`/api/equipment/${equipmentId}/maintenance-ticket`, {
        ...ticketData,
        equipmentId,
        createdAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error creating maintenance ticket:', error);
      throw error;
    }
  },

  // Schedule preventive maintenance
  scheduleMaintenance: async (equipmentId, scheduleData) => {
    try {
      const response = await apiClient.post(`/api/equipment/${equipmentId}/schedule-maintenance`, {
        ...scheduleData,
        scheduledAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error scheduling maintenance:', error);
      throw error;
    }
  },

  // Get equipment alerts/issues
  getEquipmentAlerts: async (equipmentId) => {
    try {
      const response = await apiClient.get(`/api/equipment/${equipmentId}/alerts`);
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error fetching equipment alerts:', error);
      throw error;
    }
  },

  // Update equipment inventory (add/remove equipment)
  updateInventory: async (inventoryData) => {
    try {
      const response = await apiClient.post('/api/equipment/inventory', {
        ...inventoryData,
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error updating inventory:', error);
      throw error;
    }
  },

  // Get equipment by technician's assigned area/location
  getEquipmentByTechnicianArea: async (technicianId) => {
    try {
      const response = await apiClient.get(`/api/equipment/technician/${technicianId}/area`);
      return response.data;
    } catch (error) {
      console.error('EquipmentService: Error fetching equipment by technician area:', error);
      throw error;
    }
  }
};