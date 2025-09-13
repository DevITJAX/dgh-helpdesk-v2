import apiClient from './apiClient';
import { DashboardStatistics } from '../types/dashboard.ts';

const API_BASE_URL = '/api/dashboard';

const dashboardService = {
  /**
   * Fetch overall dashboard statistics
   * @returns {Promise<DashboardStatistics>}
   */
  getStatistics: async () => {
    try {
      console.log('DashboardService: Fetching statistics...');
      const response = await apiClient.get(`${API_BASE_URL}/statistics`);
      console.log('DashboardService: Statistics response:', response.data);
      return response.data;
    } catch (error) {
      console.error('DashboardService: Error fetching statistics:', error);
      throw error;
    }
  },

  // ===== NEW TECHNICIAN-SPECIFIC METHODS =====

  // Get technician-specific statistics
  getTechnicianStatistics: async (technicianId) => {
    try {
      console.log('DashboardService: Fetching technician statistics for:', technicianId);
      const response = await apiClient.get(`${API_BASE_URL}/technician/${technicianId}/statistics`);
      console.log('DashboardService: Technician statistics response:', response.data);
      return response.data;
    } catch (error) {
      console.error('DashboardService: Error fetching technician statistics:', error);
      throw error;
    }
  },

  // Get technician's workload overview
  getTechnicianWorkload: async (technicianId) => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/technician/${technicianId}/workload`);
      return response.data;
    } catch (error) {
      console.error('DashboardService: Error fetching technician workload:', error);
      throw error;
    }
  },

  // Get technician's performance metrics
  getTechnicianPerformance: async (technicianId, period = '30') => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/technician/${technicianId}/performance`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('DashboardService: Error fetching technician performance:', error);
      throw error;
    }
  },

  // Get technician's assigned equipment statistics
  getTechnicianEquipmentStats: async (technicianId) => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/technician/${technicianId}/equipment-stats`);
      return response.data;
    } catch (error) {
      console.error('DashboardService: Error fetching technician equipment stats:', error);
      throw error;
    }
  },

  // Get priority queue for technician
  getTechnicianPriorityQueue: async (technicianId) => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/technician/${technicianId}/priority-queue`);
      return response.data;
    } catch (error) {
      console.error('DashboardService: Error fetching technician priority queue:', error);
      throw error;
    }
  },

  // Get technician's time tracking summary
  getTechnicianTimeTracking: async (technicianId, period = '7') => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/technician/${technicianId}/time-tracking`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('DashboardService: Error fetching technician time tracking:', error);
      throw error;
    }
  },

  // Get equipment alerts for technician's area
  getTechnicianEquipmentAlerts: async (technicianId) => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/technician/${technicianId}/equipment-alerts`);
      return response.data;
    } catch (error) {
      console.error('DashboardService: Error fetching technician equipment alerts:', error);
      throw error;
    }
  },

  // Get recent activity for technician
  getTechnicianRecentActivity: async (technicianId, limit = 10) => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/technician/${technicianId}/recent-activity`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('DashboardService: Error fetching technician recent activity:', error);
      throw error;
    }
  },

  /**
   * Fetch recent tickets for dashboard
   * @param {number} limit
   * @returns {Promise<any[]>}
   */
  getRecentTickets: async (limit = 5) => {
    try {
      console.log('DashboardService: Fetching recent tickets...');
      const response = await apiClient.get('/api/tickets', {
        params: { limit, sort: 'createdAt,desc' },
      });
      console.log('DashboardService: Recent tickets response:', response.data);
      
      // Ensure we always return an array
      const tickets = response.data.content || response.data;
      return Array.isArray(tickets) ? tickets : [];
    } catch (error) {
      console.error('DashboardService: Error fetching recent tickets:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }
};

export default dashboardService;
