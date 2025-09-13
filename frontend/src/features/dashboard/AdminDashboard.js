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
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  BugReport,
  People,
  Add,
  Assignment,
  Assessment,
  Warning,
  CheckCircle,
  Schedule,
  PriorityHigh,
  Refresh,
  Search,
  FilterList,
  History,
  Security,
  Person,
  Settings,
  Computer
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';
import activityLogService from '../../services/activityLogService';
import UserForm from '../users/components/UserForm';
import dashboardService from '../../services/dashboardService';
import { DashboardStatistics } from '../../types/dashboard.ts';
import { useAuth } from '../../contexts/AuthContext';
import EnhancedPagination from '../../components/common/EnhancedPagination';
import PageLayout from '../../components/common/PageLayout';

const AdminDashboard = ({ statistics, loading, error }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Add this line to get user from auth context
  const [recentTickets, setRecentTickets] = useState([]);
  const [technicianPerformance, setTechnicianPerformance] = useState([]);
  const [equipmentStatus, setEquipmentStatus] = useState({ active: 0, inactive: 0, critical: 0 });
  const [activityLog, setActivityLog] = useState([]);
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState(null);
  const [logPage, setLogPage] = useState(0);
  const [logTotalPages, setLogTotalPages] = useState(0);
  const [logTotalElements, setLogTotalElements] = useState(0);
  
  // User creation dialog state
  const [userFormOpen, setUserFormOpen] = useState(false);
  
  // Ticket assignment dialog state
  const [ticketAssignmentOpen, setTicketAssignmentOpen] = useState(false);
  const [availableTickets, setAvailableTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [unassignedTickets, setUnassignedTickets] = useState([]);
  const [availableTechnicians, setAvailableTechnicians] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [assignmentType, setAssignmentType] = useState('unassigned'); // 'unassigned' or 'reassign'
  
  // Notification state
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    // Simulate API calls for additional dashboard data
    setRecentTickets([
      { id: 1, title: 'Network connectivity issue', priority: 'HIGH', status: 'IN_PROGRESS', assignedTo: 'Ahmed Benali', createdAt: '2024-01-15' },
      { id: 2, title: 'Printer not working', priority: 'MEDIUM', status: 'OPEN', assignedTo: 'Fatima Zahra', createdAt: '2024-01-14' },
      { id: 3, title: 'Software installation request', priority: 'LOW', status: 'RESOLVED', assignedTo: 'Mohammed Alami', createdAt: '2024-01-13' },
    ]);

    setTechnicianPerformance([
      { name: 'Ahmed Benali', resolved: 45, pending: 8, slaCompliance: 92 },
      { name: 'Fatima Zahra', resolved: 38, pending: 12, slaCompliance: 88 },
      { name: 'Mohammed Alami', resolved: 52, pending: 5, slaCompliance: 95 },
    ]);

    setEquipmentStatus({ active: 156, inactive: 12, critical: 3 });
  }, []);

  // Load activity logs when tab is active
  useEffect(() => {
    if (activeTab === 1) {
      loadActivityLogs();
    }
  }, [activeTab, logFilter, logSearch, logPage]);

  // Redirect non-admin users away from activity log tab
  useEffect(() => {
    if (activeTab === 1 && (!user || user.role !== 'ADMIN')) {
      setActiveTab(0);
    }
  }, [activeTab, user]);

  const loadActivityLogs = async () => {
    
    try {
      setLogLoading(true);
      setLogError(null);

      // Check if user has ADMIN role
      if (!user || user.role !== 'ADMIN') {
        setLogError('Access denied: Activity logs are only available to administrators.');
        setActivityLog([]);
        return;
      }

      const params = {
        page: logPage,
        size: 50,
        searchTerm: logSearch || undefined,
        severity: logFilter === 'all' ? undefined : logFilter.toUpperCase()
      };

      const response = await activityLogService.getActivityLogs(params);
      
      setActivityLog(response.content.map(activityLogService.formatActivityLog));
      setLogTotalPages(response.totalPages);
      setLogTotalElements(response.totalElements);
    } catch (err) {
      console.error('Error loading activity logs:', err);
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        setLogError('Access denied: You do not have permission to view activity logs.');
      } else if (err.response?.status === 500) {
        setLogError('Server error: Activity logs service is temporarily unavailable.');
      } else if (err.message?.includes('Network Error')) {
        setLogError('Network error: Cannot connect to the server.');
      } else {
        setLogError('Failed to load activity logs: ' + (err.message || 'Unknown error'));
      }
      
      // Fallback to mock data for demonstration
      setActivityLog([
        {
          id: 1,
          timestamp: '2024-01-15 14:30:25',
          user: 'Ahmed Benali',
          action: 'TICKET_STATUS_CHANGE',
          details: 'Changed ticket #1234 status from OPEN to IN_PROGRESS',
          severity: 'INFO',
          ipAddress: '192.168.1.45',
          userAgent: 'Chrome/120.0.0.0'
        },
        {
          id: 2,
          timestamp: '2024-01-15 14:25:10',
          user: 'admin@dgh.gov.ma',
          action: 'USER_CREATED',
          details: 'Created new user: Fatima Zahra (TECHNICIAN)',
          severity: 'SUCCESS',
          ipAddress: '192.168.1.1',
          userAgent: 'Chrome/120.0.0.0'
        },
        {
          id: 3,
          timestamp: '2024-01-15 14:20:15',
          user: 'Mohammed Alami',
          action: 'TICKET_ASSIGNED',
          details: 'Assigned ticket #1235 to Ahmed Benali',
          severity: 'WARNING',
          ipAddress: '192.168.1.67',
          userAgent: 'Firefox/121.0.0'
        },
        {
          id: 4,
          timestamp: '2024-01-15 14:15:30',
          user: 'admin@dgh.gov.ma',
          action: 'SYSTEM_CONFIG_CHANGE',
          details: 'Updated SLA settings for critical tickets',
          severity: 'ERROR',
          ipAddress: '192.168.1.1',
          userAgent: 'Chrome/120.0.0.0'
        },
        {
          id: 5,
          timestamp: '2024-01-15 14:10:45',
          user: 'Fatima Zahra',
          action: 'TICKET_RESOLVED',
          details: 'Resolved ticket #1230: Printer connectivity issue',
          severity: 'SUCCESS',
          ipAddress: '192.168.1.89',
          userAgent: 'Edge/120.0.0.0'
        },
        {
          id: 6,
          timestamp: '2024-01-15 14:05:20',
          user: 'admin@dgh.gov.ma',
          action: 'EQUIPMENT_DISCOVERED',
          details: 'SNMP discovery found 3 new network devices',
          severity: 'INFO',
          ipAddress: '192.168.1.1',
          userAgent: 'Chrome/120.0.0.0'
        },
        {
          id: 7,
          timestamp: '2024-01-15 14:00:10',
          user: 'Ahmed Benali',
          action: 'LOGIN',
          details: 'User logged in successfully',
          severity: 'INFO',
          ipAddress: '192.168.1.45',
          userAgent: 'Chrome/120.0.0.0'
        },
        {
          id: 8,
          timestamp: '2024-01-15 13:55:30',
          user: 'unknown@dgh.gov.ma',
          action: 'LOGIN_FAILED',
          details: 'Failed login attempt for user: test@dgh.gov.ma',
          severity: 'ERROR',
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome/120.0.0.0'
        }
      ]);
    } finally {
      setLogLoading(false);
    }
  };

  // Replace mock data useEffect with real API call for recent tickets
  useEffect(() => {
    const fetchRecentTickets = async () => {
      try {
        const tickets = await dashboardService.getRecentTickets(5);
        setRecentTickets(tickets);
      } catch (err) {
        setRecentTickets([]);
      }
    };
    fetchRecentTickets();
  }, []);

  // Remove mock data for technicianPerformance and equipmentStatus, or replace with real API calls if available
  // useEffect(() => {
  //   // Simulate API calls for additional dashboard data
  //   setTechnicianPerformance([
  //     { name: 'Ahmed Benali', resolved: 45, pending: 8, slaCompliance: 92 },
  //     { name: 'Fatima Zahra', resolved: 38, pending: 12, slaCompliance: 88 },
  //     { name: 'Mohammed Alami', resolved: 52, pending: 5, slaCompliance: 95 },
  //   ]);

  //   setEquipmentStatus({ active: 156, inactive: 12, critical: 3 });
  // }, []);

  const StatCard = ({ title, value, icon, color = 'primary.main', subtitle, trend }) => (
    <Card sx={{ height: '100%', position: 'relative' }}>
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

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'ERROR': return <Warning color="error" />;
      case 'WARNING': return <Warning color="warning" />;
      case 'SUCCESS': return <CheckCircle color="success" />;
      case 'INFO': return <Schedule color="info" />;
      default: return <History color="default" />;
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'LOGIN': return <Person color="primary" />;
      case 'LOGIN_FAILED': return <Security color="error" />;
      case 'TICKET_STATUS_CHANGE': return <BugReport color="warning" />;
      case 'TICKET_ASSIGNED': return <Assignment color="info" />;
      case 'TICKET_RESOLVED': return <CheckCircle color="success" />;
      case 'USER_CREATED': return <Person color="success" />;
      case 'SYSTEM_CONFIG_CHANGE': return <Settings color="warning" />;
      case 'EQUIPMENT_DISCOVERED': return <Computer color="info" />;
      default: return <History color="default" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'ERROR': return 'error';
      case 'WARNING': return 'warning';
      case 'SUCCESS': return 'success';
      case 'INFO': return 'info';
      default: return 'default';
    }
  };

  const ticketStatusData = [
    { name: 'Open', value: statistics?.ticketStatistics?.openTickets || 0, color: '#f44336' },
    { name: 'In Progress', value: statistics?.ticketStatistics?.inProgressTickets || 0, color: '#ff9800' },
    { name: 'Resolved', value: statistics?.ticketStatistics?.resolvedTickets || 0, color: '#4caf50' },
    { name: 'Closed', value: statistics?.ticketStatistics?.closedTickets || 0, color: '#9e9e9e' },
  ];

  const handleLogPageChange = (newPage) => {
    setLogPage(newPage);
  };

  const handleLogRowsPerPageChange = (newRowsPerPage) => {
    setLogPage(0); // Reset to first page when changing rows per page
    // You might want to add a state for logRowsPerPage if needed
  };

  // Handler functions for quick action buttons
  const handleCreateUser = () => {
    setUserFormOpen(true);
  };

  const handleAssignTickets = () => {
    // Load available tickets and technicians for assignment
    loadAssignmentData();
    setTicketAssignmentOpen(true);
  };

  const loadAssignmentData = async () => {
    try {
      // Fetch real data from backend APIs
      const [unassignedTicketsResponse, allTicketsResponse, techniciansResponse] = await Promise.all([
        fetch('/api/tickets?status=OPEN&assignedTo=null'),
        fetch('/api/tickets?status=OPEN'),
        fetch('/api/users?role=TECHNICIAN&isActive=true')
      ]);

      if (unassignedTicketsResponse.ok && allTicketsResponse.ok && techniciansResponse.ok) {
        const unassignedTickets = await unassignedTicketsResponse.json();
        const allTickets = await allTicketsResponse.json();
        const technicians = await techniciansResponse.json();
        
        setUnassignedTickets(unassignedTickets.content || unassignedTickets || []);
        setAllTickets(allTickets.content || allTickets || []);
        setAvailableTickets(unassignedTickets.content || unassignedTickets || []); // Initialize with unassigned tickets
        setAvailableTechnicians(technicians.content || technicians || []);
      } else {
        // Fallback to mock data if API calls fail
        console.warn('API calls failed, using mock data');
        setUnassignedTickets([
          { id: 1, title: 'Network connectivity issue', priority: 'HIGH', status: 'OPEN' },
          { id: 2, title: 'Printer not working', priority: 'MEDIUM', status: 'OPEN' },
          { id: 3, title: 'Software installation request', priority: 'LOW', status: 'OPEN' },
        ]);
        
        setAllTickets([
          { id: 4, title: 'Network connectivity issue', priority: 'HIGH', status: 'OPEN' },
          { id: 5, title: 'Printer not working', priority: 'MEDIUM', status: 'OPEN' },
          { id: 6, title: 'Software installation request', priority: 'LOW', status: 'OPEN' },
        ]);

        setAvailableTickets([
          { id: 1, title: 'Network connectivity issue', priority: 'HIGH', status: 'OPEN' },
          { id: 2, title: 'Printer not working', priority: 'MEDIUM', status: 'OPEN' },
          { id: 3, title: 'Software installation request', priority: 'LOW', status: 'OPEN' },
        ]);

        setAvailableTechnicians([
          { id: 2, fullName: 'John Doe', department: 'IT Department' },
          { id: 3, fullName: 'Jane Smith', department: 'IT Department' },
        ]);
      }
    } catch (error) {
      console.error('Error loading assignment data:', error);
      // Fallback to mock data
      setUnassignedTickets([
        { id: 1, title: 'Network connectivity issue', priority: 'HIGH', status: 'OPEN' },
        { id: 2, title: 'Printer not working', priority: 'MEDIUM', status: 'OPEN' },
        { id: 3, title: 'Software installation request', priority: 'LOW', status: 'OPEN' },
      ]);
      
      setAllTickets([
        { id: 4, title: 'Network connectivity issue', priority: 'HIGH', status: 'OPEN' },
        { id: 5, title: 'Printer not working', priority: 'MEDIUM', status: 'OPEN' },
        { id: 6, title: 'Software installation request', priority: 'LOW', status: 'OPEN' },
      ]);

      setAvailableTickets([
        { id: 1, title: 'Network connectivity issue', priority: 'HIGH', status: 'OPEN' },
        { id: 2, title: 'Printer not working', priority: 'MEDIUM', status: 'OPEN' },
        { id: 3, title: 'Software installation request', priority: 'LOW', status: 'OPEN' },
      ]);

      setAvailableTechnicians([
        { id: 2, fullName: 'John Doe', department: 'IT Department' },
        { id: 3, fullName: 'Jane Smith', department: 'IT Department' },
      ]);
    }
  };

  const switchAssignmentType = () => {
    const newType = assignmentType === 'unassigned' ? 'reassign' : 'unassigned';
    setAssignmentType(newType);
    setSelectedTicket(''); // Clear selected ticket when switching type
    setSelectedTechnician(''); // Clear selected technician when switching type
    
    // Set available tickets based on type
    if (newType === 'unassigned') {
      setAvailableTickets(unassignedTickets);
    } else {
      setAvailableTickets(allTickets);
    }
  };

  const handleTicketAssignmentClose = () => {
    setTicketAssignmentOpen(false);
    setSelectedTicket('');
    setSelectedTechnician('');
  };

  const handleTicketAssignmentSave = async () => {
    if (!selectedTicket || !selectedTechnician) {
      return;
    }
    
    try {
      // Make actual API call to assign ticket
      const response = await fetch(`/api/tickets/${selectedTicket}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignedToId: selectedTechnician })
      });

      if (response.ok) {
        setTicketAssignmentOpen(false);
        setSelectedTicket('');
        setSelectedTechnician('');
        
        // Show success notification
        setNotification({
          open: true,
          message: 'Ticket assigned successfully!',
          severity: 'success'
        });
        
        // Optionally refresh dashboard data
        // You could add a callback to refresh the dashboard statistics here
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign ticket');
      }
    } catch (error) {
      console.error('Error assigning ticket:', error);
      setNotification({
        open: true,
        message: `Error assigning ticket: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleGenerateReport = async () => {
    try {
      // Show loading notification
      setNotification({
        open: true,
        message: 'Generating report...',
        severity: 'info'
      });

      // Prepare report data
      const reportData = {
        generatedAt: new Date().toLocaleString(),
        generatedBy: user?.fullName || user?.username || 'Unknown',
        statistics: {
          tickets: {
            total: statistics?.ticketStatistics?.totalTickets || 0,
            open: statistics?.ticketStatistics?.openTickets || 0,
            inProgress: statistics?.ticketStatistics?.inProgressTickets || 0,
            resolved: statistics?.ticketStatistics?.resolvedTickets || 0,
            closed: statistics?.ticketStatistics?.closedTickets || 0,
            slaBreached: statistics?.ticketStatistics?.slaBreachedTickets || 0
          },
          users: {
            total: statistics?.userStatistics?.totalUsers || 0,
            active: statistics?.userStatistics?.activeUsers || 0,
            inactive: statistics?.userStatistics?.inactiveUsers || 0
          },
          equipment: {
            total: statistics?.equipmentStatistics?.totalEquipment || 0,
            online: statistics?.equipmentStatistics?.onlineEquipment || 0,
            offline: statistics?.equipmentStatistics?.offlineEquipment || 0,
            critical: statistics?.equipmentStatistics?.criticalEquipment || 0
          }
        },
        recentTickets: recentTickets.slice(0, 10), // Last 10 tickets
        ticketStatusDistribution: ticketStatusData
      };

      // Create CSV content
      const csvContent = generateCSVReport(reportData);
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `DGH_HelpDesk_Report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success notification
      setNotification({
        open: true,
        message: 'Report generated and downloaded successfully!',
        severity: 'success'
      });

    } catch (error) {
      console.error('Error generating report:', error);
      setNotification({
        open: true,
        message: 'Failed to generate report. Please try again.',
        severity: 'error'
      });
    }
  };

  const generateCSVReport = (data) => {
    const lines = [];
    
    // Header
    lines.push('DGH HelpDesk - Dashboard Report');
    lines.push(`Generated on: ${data.generatedAt}`);
    lines.push(`Generated by: ${data.generatedBy}`);
    lines.push('');
    
    // Ticket Statistics
    lines.push('TICKET STATISTICS');
    lines.push('Metric,Value');
    lines.push(`Total Tickets,${data.statistics.tickets.total}`);
    lines.push(`Open Tickets,${data.statistics.tickets.open}`);
    lines.push(`In Progress Tickets,${data.statistics.tickets.inProgress}`);
    lines.push(`Resolved Tickets,${data.statistics.tickets.resolved}`);
    lines.push(`Closed Tickets,${data.statistics.tickets.closed}`);
    lines.push(`SLA Breached Tickets,${data.statistics.tickets.slaBreached}`);
    lines.push('');
    
    // User Statistics
    lines.push('USER STATISTICS');
    lines.push('Metric,Value');
    lines.push(`Total Users,${data.statistics.users.total}`);
    lines.push(`Active Users,${data.statistics.users.active}`);
    lines.push(`Inactive Users,${data.statistics.users.inactive}`);
    lines.push('');
    
    // Equipment Statistics
    lines.push('EQUIPMENT STATISTICS');
    lines.push('Metric,Value');
    lines.push(`Total Equipment,${data.statistics.equipment.total}`);
    lines.push(`Online Equipment,${data.statistics.equipment.online}`);
    lines.push(`Offline Equipment,${data.statistics.equipment.offline}`);
    lines.push(`Critical Equipment,${data.statistics.equipment.critical}`);
    lines.push('');
    
    // Ticket Status Distribution
    lines.push('TICKET STATUS DISTRIBUTION');
    lines.push('Status,Count');
    data.ticketStatusDistribution.forEach(status => {
      lines.push(`${status.name},${status.value}`);
    });
    lines.push('');
    
    // Recent Tickets
    lines.push('RECENT TICKETS (Last 10)');
    lines.push('ID,Title,Priority,Status,Assigned To,Created At');
    data.recentTickets.forEach(ticket => {
      lines.push(`${ticket.id},"${ticket.title}",${ticket.priority},${ticket.status},"${ticket.assignedTo || 'Unassigned'}",${ticket.createdAt}`);
    });
    
    return lines.join('\n');
  };

  const handleUserFormClose = () => {
    setUserFormOpen(false);
  };

  const handleUserFormSave = async (userData) => {
    try {
      // The UserForm component will handle the actual API call
      setUserFormOpen(false);
      // Show success notification
      setNotification({
        open: true,
        message: 'User created successfully!',
        severity: 'success'
      });
      console.log('User created successfully:', userData);
    } catch (error) {
      console.error('Error creating user:', error);
      setNotification({
        open: true,
        message: 'Error creating user. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageLayout
      title="Admin Dashboard"
      loading={loading}
      error={error}
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateUser}
          >
            Create User
          </Button>
          <Button
            variant="outlined"
            startIcon={<Assignment />}
            onClick={handleAssignTickets}
          >
            Assign Ticket
          </Button>
        </Box>
      }
    >
      {/* Tabs for Dashboard and Activity Log */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Dashboard Overview" />
          {user?.role === 'ADMIN' && <Tab label="Activity Log" />}
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Global Ticket Overview Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Tickets"
              value={statistics?.ticketStatistics?.totalTickets || 0}
              icon={<BugReport sx={{ color: 'white' }} />}
              color="primary.main"
              subtitle="All tickets in the system"
              trend="+12% this week"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Open Tickets"
              value={statistics?.ticketStatistics?.openTickets || 0}
              icon={<BugReport sx={{ color: 'white' }} />}
              color="error.main"
              subtitle="Tickets awaiting resolution"
              trend="-5% this week"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="SLA Breached"
              value={statistics?.ticketStatistics?.slaBreachedTickets || 0}
              icon={<Warning sx={{ color: 'white' }} />}
              color="error.main"
              subtitle="Tickets exceeding SLA"
              trend="+2 this week"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={statistics?.userStatistics?.totalUsers || 0}
              icon={<People sx={{ color: 'white' }} />}
              color="success.main"
              subtitle="Registered system users"
              trend="+3 this month"
            />
          </Grid>

          {/* Ticket Status Distribution Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ticket Status Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ticketStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {ticketStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Equipment Monitoring */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Equipment Status
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                      <Typography variant="h4">{statistics?.equipmentStatistics?.onlineEquipment ?? 0}</Typography>
                      <Typography variant="body2" color="text.secondary">Active</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Schedule sx={{ fontSize: 40, color: 'warning.main' }} />
                      <Typography variant="h4">{statistics?.equipmentStatistics?.offlineEquipment ?? 0}</Typography>
                      <Typography variant="body2" color="text.secondary">Inactive</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Warning sx={{ fontSize: 40, color: 'error.main' }} />
                      <Typography variant="h4">0</Typography>
                      <Typography variant="body2" color="text.secondary">Critical</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Tickets & Escalations */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Tickets & Escalations
                  </Typography>
                  <IconButton size="small">
                    <Refresh />
                  </IconButton>
                </Box>
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {recentTickets.map((ticket, index) => (
                    <React.Fragment key={ticket.id}>
                      <ListItem>
                        <ListItemIcon>
                          <PriorityHigh color={getPriorityColor(ticket.priority)} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {ticket.title}
                              </Typography>
                              <Chip 
                                label={ticket.priority} 
                                size="small" 
                                color={getPriorityColor(ticket.priority)}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Assigned to: {ticket.assignedTo ? (ticket.assignedTo.fullName || ticket.assignedTo.ldapUsername || ticket.assignedTo.email) : '-'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Status: {ticket.status} • Created: {ticket.createdAt}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentTickets.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Box>
          {/* Activity Log Header with Filters */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              System Activity Log
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search activities..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ minWidth: 250 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  label="Filter"
                >
                  <MenuItem value="all">All Activities</MenuItem>
                  <MenuItem value="error">Errors</MenuItem>
                  <MenuItem value="warning">Warnings</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadActivityLogs}
                disabled={logLoading}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {logError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {logError}
            </Alert>
          )}

          {/* Activity Log Table */}
          <Card>
            <CardContent>
              {logLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Details</TableCell>
                          <TableCell>Severity</TableCell>
                          <TableCell>IP Address</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activityLog.map((log) => (
                          <TableRow key={log.id} hover>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {log.timestamp}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Person sx={{ mr: 1, fontSize: 16 }} />
                                <Typography variant="body2">
                                  {log.user}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getActionIcon(log.action)}
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                  {log.action}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {log.details}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={log.severity}
                                size="small"
                                color={getSeverityColor(log.severity)}
                                icon={getSeverityIcon(log.severity)}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {log.ipAddress}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {activityLog.length === 0 && !logLoading && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <History sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        No activity logs found matching your criteria
                      </Typography>
                    </Box>
                  )}

                  {/* Enhanced Pagination */}
                  {logTotalPages > 1 && (
                    <EnhancedPagination
                      count={logTotalElements}
                      page={logPage}
                      rowsPerPage={50} // Fixed size for activity logs
                      onPageChange={handleLogPageChange}
                      onRowsPerPageChange={handleLogRowsPerPageChange}
                      rowsPerPageOptions={[25, 50, 100]}
                      loading={logLoading}
                      showInfo={true}
                      showPageSizeSelector={false} // Disable page size selector for activity logs
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* User Creation Dialog */}
      <UserForm
        open={userFormOpen}
        onClose={handleUserFormClose}
        onSave={handleUserFormSave}
      />

      {/* Ticket Assignment Dialog */}
      <Dialog 
        open={ticketAssignmentOpen} 
        onClose={handleTicketAssignmentClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Assignment sx={{ mr: 1 }} />
            Assign Ticket to Technician
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant={assignmentType === 'unassigned' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={switchAssignmentType}
                >
                  {assignmentType === 'unassigned' ? 'Unassigned Tickets' : 'All Open Tickets'}
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Ticket</InputLabel>
                <Select
                  value={selectedTicket}
                  onChange={(e) => setSelectedTicket(e.target.value)}
                  label="Select Ticket"
                >
                  {availableTickets.map((ticket) => (
                    <MenuItem key={ticket.id} value={ticket.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body2">{ticket.title || ticket.name}</Typography>
                        <Chip 
                          label={ticket.priority} 
                          size="small" 
                          color={getPriorityColor(ticket.priority)}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Technician</InputLabel>
                <Select
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  label="Select Technician"
                >
                  {availableTechnicians.map((technician) => (
                    <MenuItem key={technician.id} value={technician.id}>
                      <Box>
                        <Typography variant="body2">{technician.fullName || technician.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {technician.department}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTicketAssignmentClose}>Cancel</Button>
          <Button 
            onClick={() => navigate('/tickets')}
            variant="outlined"
          >
            View All Tickets
          </Button>
          <Button 
            onClick={handleTicketAssignmentSave}
            variant="contained"
            disabled={!selectedTicket || !selectedTechnician}
          >
            Assign Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleNotificationClose} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default AdminDashboard; 