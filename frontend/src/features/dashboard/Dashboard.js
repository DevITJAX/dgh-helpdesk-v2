import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  BugReport,
  People,
  Computer
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import dashboardService from '../../services/dashboardService';
import UserInfo from '../../components/common/UserInfo';
import DatabaseViewer from '../../components/common/DatabaseViewer';
import H2ConsoleInfo from '../../components/common/H2ConsoleInfo';
import AdminDashboard from './AdminDashboard';
import TechnicianDashboard from './TechnicianDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Debug logging
  console.log('Dashboard - user:', user);
  console.log('Dashboard - isAuthenticated:', isAuthenticated);
  console.log('Dashboard - authLoading:', authLoading);
  console.log('Dashboard - user role:', user?.role);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getStatistics();
        setStatistics(data);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchStatistics();
    }
  }, [isAuthenticated, user]);

  // Role-based dashboard routing
  const renderRoleBasedDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case 'ADMIN':
        console.log('Dashboard: Rendering AdminDashboard for user:', user.username);
        return (
          <AdminDashboard 
            statistics={statistics} 
            loading={loading} 
            error={error} 
          />
        );
      
      case 'TECHNICIAN':
        console.log('Dashboard: Rendering TechnicianDashboard for user:', user.username);
        return (
          <TechnicianDashboard 
            statistics={statistics} 
            loading={loading} 
            error={error} 
          />
        );
      
      case 'USER':
      case 'EMPLOYEE':
        console.log('Dashboard: Rendering EmployeeDashboard for user:', user.username, 'with role:', user.role);
        return (
          <EmployeeDashboard 
            statistics={statistics} 
            loading={loading} 
            error={error} 
          />
        );
      
      default:
        console.log('Dashboard: Unknown role, rendering default dashboard for user:', user.username);
        return <DefaultDashboard statistics={statistics} loading={loading} error={error} />;
    }
  };

  // Default dashboard for unknown roles or fallback
  const DefaultDashboard = ({ statistics, loading, error }) => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
          Welcome to DGH HelpDesk
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: 'primary.main',
                      borderRadius: '50%',
                      p: 1,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <BugReport sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6" component="div">
                    Total Tickets
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {statistics?.ticketStatistics?.totalTickets || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  All tickets in the system
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: 'error.main',
                      borderRadius: '50%',
                      p: 1,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <BugReport sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6" component="div">
                    Open Tickets
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {statistics?.ticketStatistics?.openTickets || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Tickets awaiting resolution
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: 'success.main',
                      borderRadius: '50%',
                      p: 1,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <People sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6" component="div">
                    Total Users
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {statistics?.userStatistics?.totalUsers || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Registered system users
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: 'info.main',
                      borderRadius: '50%',
                      p: 1,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Computer sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6" component="div">
                    Equipment
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {statistics?.equipmentStatistics?.totalEquipment || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Tracked IT assets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* User Information */}
        <Box sx={{ mt: 4 }}>
          <UserInfo user={user} />
        </Box>

        {/* Development Tools (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 4 }}>
            <DatabaseViewer />
            <H2ConsoleInfo />
          </Box>
        )}
      </Box>
    );
  };

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Alert severity="warning">
          Please log in to access the dashboard.
        </Alert>
      </Box>
    );
  }

  // Render the appropriate dashboard based on user role
  return renderRoleBasedDashboard();
};

export default Dashboard;
