import apiClient from './apiClient';

/**
 * Service for managing activity logs
 * Provides methods for fetching and filtering activity logs for admin monitoring
 */
export const activityLogService = {
  /**
   * Get paginated activity logs with filters
   */
  getActivityLogs: async (params = {}) => {
    const {
      userIdentifier,
      action,
      severity,
      startDate,
      endDate,
      searchTerm,
      page = 0,
      size = 50
    } = params;

    const queryParams = new URLSearchParams();
    if (userIdentifier) queryParams.append('userIdentifier', userIdentifier);
    if (action) queryParams.append('action', action);
    if (severity) queryParams.append('severity', severity);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (searchTerm) queryParams.append('searchTerm', searchTerm);
    queryParams.append('page', page);
    queryParams.append('size', size);

    const response = await apiClient.get(`/api/activity-logs?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get recent activity logs
   */
  getRecentActivityLogs: async () => {
    const response = await apiClient.get('/api/activity-logs/recent');
    return response.data;
  },

  /**
   * Get activity logs by user
   */
  getActivityLogsByUser: async (userIdentifier) => {
    const response = await apiClient.get(`/api/activity-logs/user/${userIdentifier}`);
    return response.data;
  },

  /**
   * Get activity logs by severity
   */
  getActivityLogsBySeverity: async (severity) => {
    const response = await apiClient.get(`/api/activity-logs/severity/${severity}`);
    return response.data;
  },

  /**
   * Get activity logs by action
   */
  getActivityLogsByAction: async (action) => {
    const response = await apiClient.get(`/api/activity-logs/action/${action}`);
    return response.data;
  },

  /**
   * Search activity logs
   */
  searchActivityLogs: async (searchTerm) => {
    const response = await apiClient.get(`/api/activity-logs/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  /**
   * Get activity statistics for the last 24 hours
   */
  getActivityStatistics: async () => {
    const response = await apiClient.get('/api/activity-logs/statistics');
    return response.data;
  },

  /**
   * Get most active users in the last 24 hours
   */
  getMostActiveUsers: async () => {
    const response = await apiClient.get('/api/activity-logs/most-active-users');
    return response.data;
  },

  /**
   * Get most common actions in the last 24 hours
   */
  getMostCommonActions: async () => {
    const response = await apiClient.get('/api/activity-logs/most-common-actions');
    return response.data;
  },

  /**
   * Get failed login attempts in the last 24 hours
   */
  getFailedLoginAttempts: async () => {
    const response = await apiClient.get('/api/activity-logs/failed-logins');
    return response.data;
  },

  /**
   * Get suspicious activities
   */
  getSuspiciousActivities: async () => {
    const response = await apiClient.get('/api/activity-logs/suspicious-activities');
    return response.data;
  },

  /**
   * Get activity log by ID
   */
  getActivityLogById: async (id) => {
    const response = await apiClient.get(`/api/activity-logs/${id}`);
    return response.data;
  },

  /**
   * Delete old activity logs
   */
  deleteOldActivityLogs: async (daysToKeep = 90) => {
    const response = await apiClient.delete(`/api/activity-logs/cleanup?daysToKeep=${daysToKeep}`);
    return response.data;
  },

  /**
   * Export activity logs
   */
  exportActivityLogs: async (params = {}) => {
    const {
      startDate,
      endDate,
      userIdentifier,
      severity
    } = params;

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (userIdentifier) queryParams.append('userIdentifier', userIdentifier);
    if (severity) queryParams.append('severity', severity);

    const response = await apiClient.get(`/api/activity-logs/export?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Format activity log for display
   */
  formatActivityLog: (log) => {
    return {
      id: log.id,
      timestamp: new Date(log.timestamp).toLocaleString(),
      user: log.userIdentifier,
      action: log.action.replace(/_/g, ' '),
      details: log.details,
      severity: log.severity,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      sessionId: log.sessionId,
      affectedResource: log.affectedResource,
      oldValue: log.oldValue,
      newValue: log.newValue,
      department: log.department,
      location: log.location
    };
  },

  /**
   * Get severity color for UI
   */
  getSeverityColor: (severity) => {
    switch (severity) {
      case 'ERROR': return 'error';
      case 'WARNING': return 'warning';
      case 'SUCCESS': return 'success';
      case 'INFO': return 'info';
      default: return 'default';
    }
  },

  /**
   * Get action icon for UI
   */
  getActionIcon: (action) => {
    switch (action) {
      case 'LOGIN': return 'person';
      case 'LOGIN_FAILED': return 'security';
      case 'TICKET_CREATED': return 'bug_report';
      case 'TICKET_STATUS_CHANGE': return 'assignment';
      case 'TICKET_ASSIGNED': return 'assignment_ind';
      case 'TICKET_RESOLVED': return 'check_circle';
      case 'USER_CREATED': return 'person_add';
      case 'USER_UPDATED': return 'person_edit';
      case 'SYSTEM_CONFIG_CHANGE': return 'settings';
      case 'EQUIPMENT_DISCOVERED': return 'computer';
      default: return 'history';
    }
  }
};

export default activityLogService; 