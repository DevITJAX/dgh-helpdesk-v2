import apiClient from './apiClient';

export const userService = {
  getUsers: async () => {
    try {
      console.log('UserService: Fetching active users...');
      // Use the /active endpoint which returns List<User> instead of Page<User>
      const response = await apiClient.get('/api/users/active');
      console.log('UserService: Raw response:', response.data);
      console.log('UserService: Response type:', typeof response.data);
      console.log('UserService: Is array?', Array.isArray(response.data));
      
      // This endpoint should return a direct array
      if (Array.isArray(response.data)) {
        console.log('UserService: Found direct array response with', response.data.length, 'users');
        return response.data;
      }
      
      console.warn('UserService: Unexpected response structure, returning empty array');
      return [];
    } catch (error) {
      console.error('UserService: Error fetching users:', error);
      throw error;
    }
  },

  getAllUsers: async (params = {}) => {
    try {
      console.log('UserService: Fetching all users with params:', params);
      const response = await apiClient.get('/api/users', { params });
      console.log('UserService: All users response:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService: Error fetching all users:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      console.log('UserService: Creating user:', userData);
      const response = await apiClient.post('/api/users', userData);
      console.log('UserService: User created:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService: Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      console.log('UserService: Updating user:', id, userData);
      const response = await apiClient.put(`/api/users/${id}`, userData);
      console.log('UserService: User updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService: Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      console.log('UserService: Deleting user:', id);
      const response = await apiClient.delete(`/api/users/${id}`);
      console.log('UserService: User deleted');
      return response.data;
    } catch (error) {
      console.error('UserService: Error deleting user:', error);
      throw error;
    }
  },

  updateProfile: async (profileData, userId) => {
    try {
      console.log('UserService: Updating profile with data:', profileData, 'for user ID:', userId);
      const requestData = {
        userId: userId,
        ...profileData
      };
      const response = await apiClient.put('/api/users/profile', requestData);
      console.log('UserService: Profile update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService: Error updating profile:', error);
      throw error;
    }
  },

  getTechnicians: async () => {
    try {
      console.log('UserService: Fetching technicians...');
      const response = await apiClient.get('/api/users/technicians');
      console.log('UserService: Technicians response:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService: Error fetching technicians:', error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('UserService: Error fetching user by ID:', error);
      throw error;
    }
  },

  activateUser: async (id) => {
    try {
      const response = await apiClient.put(`/api/users/${id}/activate`);
      return response.data;
    } catch (error) {
      console.error('UserService: Error activating user:', error);
      throw error;
    }
  },

  deactivateUser: async (id) => {
    try {
      const response = await apiClient.put(`/api/users/${id}/deactivate`);
      return response.data;
    } catch (error) {
      console.error('UserService: Error deactivating user:', error);
      throw error;
    }
  },

  changeUserRole: async (id, role) => {
    try {
      const response = await apiClient.put(`/api/users/${id}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('UserService: Error changing user role:', error);
      throw error;
    }
  },

  getUsersByRole: async (role) => {
    try {
      const response = await apiClient.get(`/api/users/role/${role}`);
      return response.data;
    } catch (error) {
      console.error('UserService: Error fetching users by role:', error);
      throw error;
    }
  },

  getUsersByDepartment: async (department) => {
    try {
      const response = await apiClient.get(`/api/users/department/${encodeURIComponent(department)}`);
      return response.data;
    } catch (error) {
      console.error('UserService: Error fetching users by department:', error);
      throw error;
    }
  },

  searchUsers: async (searchTerm) => {
    try {
      const response = await apiClient.get(`/api/users/search`, {
        params: { name: searchTerm }
      });
      return response.data;
    } catch (error) {
      console.error('UserService: Error searching users:', error);
      throw error;
    }
  },

  getUserStatistics: async () => {
    try {
      // First try to get statistics from the backend API
      const response = await apiClient.get('/api/users/statistics');
      const apiStats = response.data;
      
      // Check if the API returned meaningful data
      if (apiStats && apiStats.totalUsers > 0) {
        console.log('UserService: Using API statistics:', apiStats);
        return apiStats;
      }
      
      // Fallback: Calculate statistics from actual user data
      console.log('UserService: API returned empty/mock data, calculating from user list...');
      const allUsersResponse = await apiClient.get('/api/users');
      const allUsers = allUsersResponse.data.content || allUsersResponse.data || [];
      
      // Calculate real statistics
      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter(user => user.isActive !== false).length;
      const inactiveUsers = totalUsers - activeUsers;
      
      // Count by role
      const adminCount = allUsers.filter(user => user.role === 'ADMIN').length;
      const technicianCount = allUsers.filter(user => user.role === 'TECHNICIAN').length;
      const employeeCount = allUsers.filter(user => user.role === 'USER' || user.role === 'EMPLOYEE').length;
      
      // Calculate department distribution
      const departmentCounts = {};
      allUsers.forEach(user => {
        if (user.department) {
          departmentCounts[user.department] = (departmentCounts[user.department] || 0) + 1;
        }
      });
      
      const calculatedStats = {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminCount,
        technicianCount,
        employeeCount,
        departmentDistribution: departmentCounts
      };
      
      console.log('UserService: Calculated statistics:', calculatedStats);
      return calculatedStats;
      
    } catch (error) {
      console.error('UserService: Error fetching user statistics:', error);
      
      // Final fallback: return basic structure with zeros
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        adminCount: 0,
        technicianCount: 0,
        employeeCount: 0,
        departmentDistribution: {}
      };
    }
  },

  checkUsernameExists: async (username) => {
    try {
      const response = await apiClient.get(`/api/users/exists/ldap/${username}`);
      return response.data;
    } catch (error) {
      console.error('UserService: Error checking username:', error);
      throw error;
    }
  },

  checkEmailExists: async (email) => {
    try {
      const response = await apiClient.get(`/api/users/exists/email/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error('UserService: Error checking email:', error);
      throw error;
    }
  },
}; 