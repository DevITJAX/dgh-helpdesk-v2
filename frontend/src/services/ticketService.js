import apiClient from './apiClient';

export const ticketService = {
  // Get all tickets (alias for getAllTickets)
  getTickets: async (params = {}) => {
    return ticketService.getAllTickets(params);
  },

  // Get all tickets with pagination and filtering
  getAllTickets: async (params = {}) => {
    try {
      console.log('ticketService: Making API call to /api/tickets');
      const response = await apiClient.get('/api/tickets', { params });
      console.log('ticketService: Raw axios response:', response);
      console.log('ticketService: Response status:', response.status);
      console.log('ticketService: Response headers:', response.headers);
      console.log('ticketService: Response data:', response.data);
      console.log('ticketService: Response data type:', typeof response.data);
      
      // Handle different response types
      let parsedData = response.data;
      if (typeof response.data === 'string') {
        console.log('ticketService: Response is string, attempting to parse JSON');
        try {
          parsedData = JSON.parse(response.data);
          console.log('ticketService: Successfully parsed JSON:', parsedData);
        } catch (parseError) {
          console.error('ticketService: Failed to parse JSON:', parseError);
          throw new Error('Invalid JSON response from server');
        }
      }
      
      console.log('ticketService: Final parsed data:', parsedData);
      return parsedData;
    } catch (error) {
      console.error('ticketService: Error in getAllTickets:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch tickets');
    }
  },

  // Get ticket by ID
  getTicketById: async (id) => {
    try {
      const response = await apiClient.get(`/api/tickets/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch ticket');
    }
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    try {
      const response = await apiClient.post('/api/tickets', ticketData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create ticket');
    }
  },

  // Update ticket
  updateTicket: async (id, ticketData) => {
    try {
      const response = await apiClient.put(`/api/tickets/${id}`, ticketData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update ticket');
    }
  },

  // Assign ticket to user
  assignTicket: async (id, assignedToId) => {
    try {
      const response = await apiClient.put(`/api/tickets/${id}/assign`, { assignedToId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to assign ticket');
    }
  },

  // Change ticket status
  changeTicketStatus: async (id, status, comment = '') => {
    try {
      const response = await apiClient.put(`/api/tickets/${id}/status`, { status, comment });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change ticket status');
    }
  },

  // Escalate ticket
  escalateTicket: async (id, reason) => {
    try {
      const response = await apiClient.put(`/api/tickets/${id}/escalate`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to escalate ticket');
    }
  },

  // Add comment to ticket
  addComment: async (id, commentData) => {
    try {
      const response = await apiClient.post(`/api/tickets/${id}/comments`, commentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add comment');
    }
  },

  // Get ticket comments
  getTicketComments: async (id) => {
    try {
      const response = await apiClient.get(`/api/tickets/${id}/comments`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch comments');
    }
  },

  // Delete ticket
  deleteTicket: async (id) => {
    try {
      const response = await apiClient.delete(`/api/tickets/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete ticket');
    }
  },

  // Get tickets by status
  getTicketsByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/api/tickets/status/${status}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tickets by status');
    }
  },

  // Get tickets by priority
  getTicketsByPriority: async (priority) => {
    try {
      const response = await apiClient.get(`/api/tickets/priority/${priority}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tickets by priority');
    }
  },

  // Get unassigned tickets
  getUnassignedTickets: async () => {
    try {
      const response = await apiClient.get('/api/tickets/unassigned');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch unassigned tickets');
    }
  },

  // Get ticket statistics
  getTicketStatistics: async () => {
    try {
      const response = await apiClient.get('/api/tickets/statistics');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch ticket statistics');
    }
  },

  // ===== NEW TECHNICIAN-SPECIFIC METHODS =====

  // Get unassigned tickets with filtering
  getUnassignedTicketsWithFilters: async (filters = {}) => {
    try {
      const params = {
        assignedToId: null,
        status: 'OPEN',
        ...filters
      };
      const response = await apiClient.get('/api/tickets', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch unassigned tickets');
    }
  },

  // Self-assign ticket (technician assigns to themselves)
  assignTicketToSelf: async (ticketId, technicianId) => {
    try {
      const response = await apiClient.put(`/api/tickets/${ticketId}/assign`, {
        assignedToId: technicianId,
        assignedAt: new Date().toISOString(),
        assignedBy: technicianId // Self-assignment
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to self-assign ticket');
    }
  },

  // Escalate ticket with detailed information
  escalateTicketWithDetails: async (ticketId, escalationData) => {
    try {
      const response = await apiClient.put(`/api/tickets/${ticketId}/escalate`, {
        ...escalationData,
        escalatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to escalate ticket');
    }
  },

  // Add time tracking to ticket
  addTimeTracking: async (ticketId, timeData) => {
    try {
      const response = await apiClient.post(`/api/tickets/${ticketId}/time-tracking`, {
        ...timeData,
        trackedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add time tracking');
    }
  },

  // Reopen a closed ticket
  reopenTicket: async (ticketId, reason) => {
    try {
      const response = await apiClient.put(`/api/tickets/${ticketId}/reopen`, { 
        reason,
        reopenedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reopen ticket');
    }
  },

  // Get technician's assigned tickets with statistics
  getTechnicianTickets: async (technicianId, filters = {}) => {
    try {
      const params = {
        assignedToId: technicianId,
        ...filters
      };
      const response = await apiClient.get('/api/tickets', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch technician tickets');
    }
  },

  // Get technician performance statistics
  getTechnicianStatistics: async (technicianId) => {
    try {
      const response = await apiClient.get(`/api/tickets/technician/${technicianId}/statistics`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch technician statistics');
    }
  },

  // Add attachment to ticket
  addAttachment: async (ticketId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(`/api/tickets/${ticketId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add attachment');
    }
  },

  // Get ticket attachments
  getTicketAttachments: async (ticketId) => {
    try {
      const response = await apiClient.get(`/api/tickets/${ticketId}/attachments`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch attachments');
    }
  }
};
