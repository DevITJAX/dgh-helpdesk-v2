import {
  Dashboard,
  BugReport,
  People,
  Computer,
  Person,
  Logout
} from '@mui/icons-material';

// Navigation configuration based on user roles
export const NAVIGATION_CONFIG = {
  ADMIN: [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Tickets', icon: <BugReport />, path: '/tickets' },
    { text: 'Users', icon: <People />, path: '/users' },
    { text: 'Equipment', icon: <Computer />, path: '/equipment' },
    { text: 'Profile', icon: <Person />, path: '/profile' }
  ],
  TECHNICIAN: [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Tickets', icon: <BugReport />, path: '/tickets' },
    { text: 'Equipment', icon: <Computer />, path: '/equipment' },
    { text: 'Profile', icon: <Person />, path: '/profile' }
  ],
  EMPLOYEE: [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Tickets', icon: <BugReport />, path: '/tickets' },
    { text: 'Profile', icon: <Person />, path: '/profile' }
  ]
};

// Get navigation items for a specific role
export const getNavigationItems = (role) => {
  return NAVIGATION_CONFIG[role] || NAVIGATION_CONFIG.EMPLOYEE;
};

// Check if a user can access a specific route
export const canAccessRoute = (userRole, route) => {
  const allowedRoutes = {
    ADMIN: ['/dashboard', '/tickets', '/users', '/equipment', '/profile'],
    TECHNICIAN: ['/dashboard', '/tickets', '/equipment', '/profile'],
    EMPLOYEE: ['/dashboard', '/tickets', '/profile']
  };
  
  return allowedRoutes[userRole]?.includes(route) || false;
}; 