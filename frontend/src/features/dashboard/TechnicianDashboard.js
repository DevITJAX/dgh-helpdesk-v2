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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  BugReport,
  Assignment,
  Warning,
  CheckCircle,
  Schedule,
  PriorityHigh,
  TrendingUp
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

const TechnicianDashboard = ({ statistics, loading, error }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myTickets, setMyTickets] = useState([]);
  const [slaAlerts, setSlaAlerts] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [performanceStats, setPerformanceStats] = useState({});

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    // Simulate API calls for technician-specific data
    setMyTickets([
      { id: 1, title: 'Network connectivity issue', priority: 'HIGH', status: 'IN_PROGRESS', slaDue: '2024-01-16 14:00', timeSpent: '2h 30m' },
      { id: 2, title: 'Printer not working', priority: 'MEDIUM', status: 'OPEN', slaDue: '2024-01-17 09:00', timeSpent: '0h 15m' },
      { id: 3, title: 'Software installation request', priority: 'LOW', status: 'RESOLVED', slaDue: '2024-01-18 16:00', timeSpent: '1h 45m' },
    ]);

    setSlaAlerts([
      { id: 1, title: 'Server down in Building A', priority: 'CRITICAL', slaDue: '2024-01-15 12:00', timeRemaining: '1h 30m' },
      { id: 2, title: 'Email system not responding', priority: 'HIGH', slaDue: '2024-01-15 15:00', timeRemaining: '4h 30m' },
    ]);

    setRecentAssignments([
      { id: 1, title: 'Network connectivity issue', priority: 'HIGH', assignedAt: '2024-01-15 09:00', status: 'IN_PROGRESS' },
      { id: 2, title: 'Printer not working', priority: 'MEDIUM', assignedAt: '2024-01-14 14:30', status: 'OPEN' },
      { id: 3, title: 'Software installation request', priority: 'LOW', assignedAt: '2024-01-13 11:15', status: 'RESOLVED' },
      { id: 4, title: 'VPN access issue', priority: 'HIGH', assignedAt: '2024-01-12 16:45', status: 'IN_PROGRESS' },
      { id: 5, title: 'Monitor replacement', priority: 'MEDIUM', assignedAt: '2024-01-12 10:20', status: 'RESOLVED' },
    ]);

    setPerformanceStats({
      weeklyResolved: 12,
      averageResolutionTime: '4h 23m',
      slaCompliance: 94,
      weeklyTrend: [
        { day: 'Mon', resolved: 3 },
        { day: 'Tue', resolved: 2 },
        { day: 'Wed', resolved: 4 },
        { day: 'Thu', resolved: 1 },
        { day: 'Fri', resolved: 2 },
      ]
    });
  }, []);

  // Handle navigation to tickets with technician filter
  const handleViewMyTickets = () => {
    // Navigate to tickets page with assignedTo filter set to current technician
    const searchParams = new URLSearchParams();
    if (user?.id) {
      searchParams.set('assignedTo', user.id);
    }
    navigate(`/tickets?${searchParams.toString()}`);
  };

  const StatCard = ({ title, value, icon, color = 'primary.main', subtitle, trend }) => (
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
        {trend && (
          <Chip 
            label={trend} 
            size="small" 
            color={trend.includes('+') ? 'success' : 'error'}
            sx={{ mt: 1 }}
          />
        )}
      </CardContent>
    </Card>
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'error';
      case 'IN_PROGRESS': return 'warning';
      case 'WAITING': return 'info';
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'default';
      default: return 'default';
    }
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
          Technician Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Assignment />}
          onClick={handleViewMyTickets}
        >
          View My Tickets
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* My Tickets Summary */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="My Open Tickets"
            value={myTickets.filter(t => t.status === 'OPEN').length}
            icon={<BugReport sx={{ color: 'white' }} />}
            color="error.main"
            subtitle="Tickets awaiting action"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={myTickets.filter(t => t.status === 'IN_PROGRESS').length}
            icon={<Schedule sx={{ color: 'white' }} />}
            color="warning.main"
            subtitle="Currently working on"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolved This Week"
            value={performanceStats.weeklyResolved}
            icon={<CheckCircle sx={{ color: 'white' }} />}
            color="success.main"
            subtitle="Successfully completed"
            trend="+2 from last week"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="SLA Compliance"
            value={`${performanceStats.slaCompliance}%`}
            icon={<TrendingUp sx={{ color: 'white' }} />}
            color="info.main"
            subtitle="Meeting service levels"
          />
        </Grid>

        {/* SLA Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  SLA Warning Alerts
                </Typography>
                <Badge badgeContent={slaAlerts.length} color="error">
                  <Warning color="error" />
                </Badge>
              </Box>
              {slaAlerts.length > 0 ? (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {slaAlerts.map((alert, index) => (
                    <React.Fragment key={alert.id}>
                      <ListItem>
                        <ListItemIcon>
                          <PriorityHigh color={getPriorityColor(alert.priority)} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {alert.title}
                              </Typography>
                              <Chip 
                                label={alert.priority} 
                                size="small" 
                                color={getPriorityColor(alert.priority)}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="error.main" sx={{ fontWeight: 'medium' }}>
                                ⚠️ Due: {alert.slaDue} ({alert.timeRemaining} remaining)
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < slaAlerts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No SLA alerts - all tickets on track!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Performance Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Performance
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                      {performanceStats.averageResolutionTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Resolution Time
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                      {performanceStats.slaCompliance}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      SLA Compliance
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceStats.weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="resolved" stroke="#1976d2" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Assignments */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Assignments
              </Typography>
              <List>
                {Array.isArray(recentAssignments) && recentAssignments.map((assignment, index) => (
                  <React.Fragment key={assignment.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Assignment color={getStatusColor(assignment.status)} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {assignment.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip 
                                label={assignment.priority} 
                                size="small" 
                                color={getPriorityColor(assignment.priority)}
                              />
                              <Chip 
                                label={assignment.status} 
                                size="small" 
                                color={getStatusColor(assignment.status)}
                              />
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            Assigned: {assignment.assignedAt}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < recentAssignments.length - 1 && <Divider />}
                  </React.Fragment>
                )) || (
                  <ListItem>
                    <ListItemText
                      primary="No recent assignments"
                      secondary="Recent assignments will appear here once they are assigned to you"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TechnicianDashboard; 