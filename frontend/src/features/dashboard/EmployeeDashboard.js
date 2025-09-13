import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  BugReport,
  Add,
  CheckCircle,
  Schedule,
  Computer,
  Person,
  Visibility
} from '@mui/icons-material';
import CreateTicketForm from '../../components/forms/CreateTicketForm';

const EmployeeDashboard = ({ statistics, loading, error }) => {
  const navigate = useNavigate();
  const [myTickets, setMyTickets] = useState([]);
  const [createFormOpen, setCreateFormOpen] = useState(false);

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    // Simulate API calls for employee-specific data
    setMyTickets([
      { id: 1, title: 'Network connectivity issue', status: 'IN_PROGRESS', createdAt: '2024-01-15' },
      { id: 2, title: 'Printer not working', status: 'OPEN', createdAt: '2024-01-14' },
      { id: 3, title: 'Software installation request', status: 'RESOLVED', createdAt: '2024-01-13' },
    ]);
  }, []);

  const StatCard = ({ title, value, icon, color = 'primary.main', subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              p: 1,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon, onClick, color = 'primary.main' }) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: '50%',
            p: 2,
            mx: 'auto',
            mb: 2,
            width: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  const handleCreateTicket = () => {
    setCreateFormOpen(true);
  };

  const handleTicketCreated = (newTicket) => {
    // Add the new ticket to the list
    setMyTickets([newTicket, ...myTickets]);
    setCreateFormOpen(false);
  };

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

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          My Dashboard
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tickets"
            value={statistics?.ticketStatistics?.totalTickets || 0}
            icon={<BugReport sx={{ color: 'white' }} />}
            color="primary.main"
            subtitle="All tickets in the system"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="My Tickets"
            value={myTickets.length}
            icon={<Person sx={{ color: 'white' }} />}
            color="info.main"
            subtitle="My submitted tickets"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open Tickets"
            value={myTickets.filter(t => t.status === 'OPEN').length}
            icon={<Schedule sx={{ color: 'white' }} />}
            color="warning.main"
            subtitle="Awaiting resolution"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolved Tickets"
            value={myTickets.filter(t => t.status === 'RESOLVED').length}
            icon={<CheckCircle sx={{ color: 'white' }} />}
            color="success.main"
            subtitle="Successfully completed"
          />
        </Grid>
      </Grid>

      {/* Equipment Card */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Equipment"
            value={statistics?.equipmentStatistics?.totalEquipment || 0}
            icon={<Computer sx={{ color: 'white' }} />}
            color="secondary.main"
            subtitle="Tracked IT assets"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
        Quick Actions
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="Create Ticket"
            description="Submit a new support request"
            icon={<Add sx={{ color: 'white', fontSize: 32 }} />}
            color="primary.main"
            onClick={handleCreateTicket}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="View Tickets"
            description="See all your tickets and their status"
            icon={<Visibility sx={{ color: 'white', fontSize: 32 }} />}
            color="info.main"
            onClick={() => navigate('/tickets')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="My Profile"
            description="View and edit your profile information"
            icon={<Person sx={{ color: 'white', fontSize: 32 }} />}
            color="success.main"
            onClick={() => navigate('/profile')}
          />
        </Grid>
      </Grid>

      {/* Create Ticket Form - Same as in Ticket Management */}
      <CreateTicketForm
        open={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
        onTicketCreated={handleTicketCreated}
      />
    </Box>
  );
};

export default EmployeeDashboard; 