// Role display utility functions

// Map backend role values to display names
const ROLE_DISPLAY_MAP = {
  'ADMIN': 'Administrator',
  'TECHNICIAN': 'Technician', 
  'EMPLOYEE': 'Employee',
  // Handle lowercase versions
  'admin': 'Administrator',
  'technician': 'Technician',
  'employee': 'Employee'
};

// Get display name for a role
export const getRoleDisplayName = (role) => {
  if (!role) return 'Unknown';
  return ROLE_DISPLAY_MAP[role] || role;
};

// Check if role is a technician
export const isTechnician = (role) => {
  return role === 'TECHNICIAN' || role === 'technician';
};

// Check if role is an admin
export const isAdmin = (role) => {
  return role === 'ADMIN' || role === 'admin';
};

// Check if role is an employee
export const isEmployee = (role) => {
  return role === 'EMPLOYEE' || role === 'employee';
}; 