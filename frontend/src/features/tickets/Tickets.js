import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  PriorityHigh,
  WarningAmber,
  LowPriority,
  Replay as ReplayIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { ticketService } from '../../services/ticketService';
import { userService } from '../../services/userService';
import CreateTicketForm from '../../components/forms/CreateTicketForm';
import { TECHNICIAN_PERMISSIONS } from '../../constants/technicianPermissions';
import { 
  PRIORITY_OPTIONS, 
  STATUS_OPTIONS, 
  PRIORITY_COLORS, 
  STATUS_COLORS,
  PRIORITY_LABELS,
  STATUS_LABELS
} from '../../constants/ticketConstants';
import EnhancedPagination from '../../components/common/EnhancedPagination';
import EnhancedFilters from '../../components/common/EnhancedFilters';
import PageLayout from '../../components/common/PageLayout';

const Tickets = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]); // All tickets for technicians
  const [unassignedTickets, setUnassignedTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'view', 'edit', 'assign', 'delete', 'escalate', 'reopen'
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0: Technician Assigned Tickets, 1: All Tickets
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    createdBy: '',
    search: '' // Added search parameter
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'OPEN',
    assignedTo: ''
  });
  const [escalationData, setEscalationData] = useState({
    reason: '',
    details: ''
  });
  const [reopenData, setReopenData] = useState({
    reason: ''
  });
  const [totalCount, setTotalCount] = useState(0);

  const { user } = useAuth();

  // Priority and Status options
  const priorities = PRIORITY_OPTIONS;
  const statuses = STATUS_OPTIONS;

  // Priority colors
  const getPriorityColor = (priority) => {
    return PRIORITY_COLORS[priority] || 'default';
  };

  // Status colors
  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || 'default';
  };

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlAssignedTo = searchParams.get('assignedTo');
    const urlStatus = searchParams.get('status');
    const urlPriority = searchParams.get('priority');
    const urlCreatedBy = searchParams.get('createdBy');
    const urlSearch = searchParams.get('search'); // Get search parameter
    
    if (urlAssignedTo || urlStatus || urlPriority || urlCreatedBy || urlSearch) {
      setFilters({
        status: urlStatus || '',
        priority: urlPriority || '',
        assignedTo: urlAssignedTo || '',
        createdBy: urlCreatedBy || '',
        search: urlSearch || '' // Initialize search parameter
      });
    }
  }, [searchParams]);

  // Load tickets and users
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Debug: Log user object to see its structure
        console.log('Tickets component - Current user object:', user);
        console.log('Tickets component - User ID:', user?.userId || user?.id);
        
        // Determine what tickets to fetch based on user role
        let ticketsData;
        let allTicketsData;
        
        if (user?.role === 'TECHNICIAN') {
          // Technicians see their assigned tickets for tab 0
          // Use userId (from backend) or fallback to id
          const technicianId = user?.userId || user?.id;
          console.log('Tickets component - Fetching tickets for technician ID:', technicianId);
          ticketsData = await ticketService.getTechnicianTickets(technicianId);
          
          // Also load all tickets for tab 1 (All Tickets)
          allTicketsData = await ticketService.getTickets();
          
          // Also load unassigned tickets if permission allows (for backward compatibility)
          if (TECHNICIAN_PERMISSIONS.viewUnassignedTickets) {
            const unassignedData = await ticketService.getUnassignedTicketsWithFilters();
            setUnassignedTickets(Array.isArray(unassignedData) ? unassignedData : 
                               (unassignedData?.content ? unassignedData.content : []));
          }
        } else if (user?.role === 'ADMIN') {
          // Admins see all tickets
          ticketsData = await ticketService.getTickets();
          allTicketsData = ticketsData; // Same data for admins
        } else {
          // Employees see only their own tickets
          const employeeId = user?.userId || user?.id;
          ticketsData = await ticketService.getTickets({ createdBy: employeeId });
          allTicketsData = ticketsData; // Same data for employees
        }
        
        // Only load users for admins (for assignment purposes)
        if (user?.role === 'ADMIN') {
          const usersData = await userService.getUsers();
          const usersArray = Array.isArray(usersData) ? usersData : 
                            (usersData?.content ? usersData.content : 
                            (usersData?.data ? usersData.data : []));
          setUsers(usersArray.filter(u => u.role === 'TECHNICIAN' || u.role === 'ADMIN'));
        }
        
        // Debug logging
        console.log('Tickets component - ticketsData:', ticketsData);
        console.log('Tickets component - allTicketsData:', allTicketsData);
        console.log('Tickets component - ticketsData type:', typeof ticketsData);
        console.log('Tickets component - ticketsData is array:', Array.isArray(ticketsData));
        
        // Ensure ticketsData is an array
        const ticketsArray = Array.isArray(ticketsData) ? ticketsData : 
                           (ticketsData?.content ? ticketsData.content : 
                           (ticketsData?.data ? ticketsData.data : []));
        
        // Ensure allTicketsData is an array
        const allTicketsArray = Array.isArray(allTicketsData) ? allTicketsData : 
                              (allTicketsData?.content ? allTicketsData.content : 
                              (allTicketsData?.data ? allTicketsData.data : []));
        
        console.log('Tickets component - ticketsArray:', ticketsArray);
        console.log('Tickets component - allTicketsArray:', allTicketsArray);
        
        setTickets(ticketsArray);
        setAllTickets(allTicketsArray);
      } catch (err) {
        setError('Failed to load tickets data');
        console.error('Error loading data:', err);
        setTickets([]);
        setAllTickets([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Filter tickets - ensure tickets is always an array
  const filteredTickets = (Array.isArray(tickets) ? tickets : []).filter(ticket => {
    if (filters.status && ticket.status !== filters.status) return false;
    if (filters.priority && ticket.priority !== filters.priority) return false;
    if (filters.assignedTo && ticket.assignedTo?.id !== filters.assignedTo) return false;
    if (filters.createdBy && ticket.createdBy?.id !== filters.createdBy) return false;
    if (filters.search && 
        !ticket.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !ticket.description.toLowerCase().includes(filters.search.toLowerCase()) &&
        !ticket.category.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Filter all tickets (for the "All Tickets" tab)
  const filteredAllTickets = (Array.isArray(allTickets) ? allTickets : []).filter(ticket => {
    if (filters.status && ticket.status !== filters.status) return false;
    if (filters.priority && ticket.priority !== filters.priority) return false;
    if (filters.assignedTo && ticket.assignedTo?.id !== filters.assignedTo) return false;
    if (filters.createdBy && ticket.createdBy?.id !== filters.createdBy) return false;
    if (filters.search && 
        !ticket.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !ticket.description.toLowerCase().includes(filters.search.toLowerCase()) &&
        !ticket.category.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Determine which tickets to show based on tab
  // Tab 0: Technician Assigned Tickets (only tickets assigned to current technician)
  // Tab 1: All Tickets (all tickets in the system)
  const isAssignedTab = (tabValue === 0 || user?.role !== 'TECHNICIAN');
  const currentTickets = isAssignedTab ? filteredTickets : filteredAllTickets;

  // Handle dialog operations
  const handleDialogOpen = (type, ticket = null) => {
    setDialogType(type);
    setSelectedTicket(ticket);
    if (ticket) {
      if (type === 'edit') {
        setFormData({
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          status: ticket.status,
          assignedTo: ticket.assignedTo?.id || ''
        });
      } else if (type === 'assign') {
        setFormData({
          ...formData,
          assignedTo: ticket.assignedTo?.id || ''
        });
      }
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTicket(null);
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'OPEN',
      assignedTo: ''
    });
    setEscalationData({ reason: '', details: '' });
    setReopenData({ reason: '' });
  };

  // Handle ticket operations
  const handleUpdateTicket = async () => {
    try {
      const updatedTicket = await ticketService.updateTicket(selectedTicket.id, formData);
      setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      handleDialogClose();
    } catch (err) {
      setError('Failed to update ticket');
      console.error('Update error:', err);
    }
  };

  const handleAssignTicket = async () => {
    try {
      const assignedTicket = await ticketService.assignTicket(selectedTicket.id, formData.assignedTo);
      setTickets(tickets.map(t => t.id === assignedTicket.id ? assignedTicket : t));
      handleDialogClose();
    } catch (err) {
      setError('Failed to assign ticket');
      console.error('Assignment error:', err);
    }
  };

  // NEW: Self-assignment for technicians
  const handleSelfAssign = async (ticketId) => {
    try {
      const technicianId = user?.userId || user?.id;
      const assignedTicket = await ticketService.assignTicketToSelf(ticketId, technicianId);
      setTickets(prev => [...prev, assignedTicket]);
      setUnassignedTickets(prev => prev.filter(t => t.id !== ticketId));
    } catch (err) {
      setError('Failed to self-assign ticket');
      console.error('Self-assignment error:', err);
    }
  };

  // NEW: Escalate ticket
  const handleEscalateTicket = async () => {
    try {
      const escalatedTicket = await ticketService.escalateTicketWithDetails(selectedTicket.id, escalationData);
      setTickets(tickets.map(t => t.id === escalatedTicket.id ? escalatedTicket : t));
      handleDialogClose();
    } catch (err) {
      setError('Failed to escalate ticket');
      console.error('Escalation error:', err);
    }
  };

  // NEW: Reopen ticket
  const handleReopenTicket = async () => {
    try {
      const reopenedTicket = await ticketService.reopenTicket(selectedTicket.id, reopenData.reason);
      setTickets(tickets.map(t => t.id === reopenedTicket.id ? reopenedTicket : t));
      handleDialogClose();
    } catch (err) {
      setError('Failed to reopen ticket');
      console.error('Reopen error:', err);
    }
  };

  const handleDeleteTicket = async () => {
    try {
      await ticketService.deleteTicket(selectedTicket.id);
      setTickets(tickets.filter(t => t.id !== selectedTicket.id));
      handleDialogClose();
    } catch (err) {
      setError('Failed to delete ticket');
      console.error('Delete error:', err);
    }
  };

  const handleRefresh = async () => {
    // Reload data
    window.location.reload();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Filter configuration for EnhancedFilters
  const filterConfigs = [
    {
      field: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All Statuses' },
        ...statuses.map(status => ({ 
          value: status, 
          label: STATUS_LABELS[status] || status 
        }))
      ]
    },
    {
      field: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: '', label: 'All Priorities' },
        ...priorities.map(priority => ({ 
          value: priority, 
          label: PRIORITY_LABELS[priority] || priority 
        }))
      ]
    },
    ...(user?.role === 'ADMIN' ? [
      {
        field: 'assignedTo',
        label: 'Assigned To',
        type: 'select',
        options: [
          { value: '', label: 'All Assignments' },
          ...users.filter(u => u.role === 'TECHNICIAN').map(user => ({ 
            value: user.id, 
            label: user.fullName || user.name 
          }))
        ]
      },
      {
        field: 'createdBy',
        label: 'Created By',
        type: 'select',
        options: [
          { value: '', label: 'All Creators' },
          ...users.map(user => ({ 
            value: user.id, 
            label: user.fullName || user.name 
          }))
        ]
      }
    ] : user?.role === 'TECHNICIAN' ? [
      {
        field: 'assignedTo',
        label: 'Assigned To',
        type: 'select',
        options: [
          { value: '', label: 'All Assignments' },
          { value: user?.userId || user?.id, label: 'My Tickets' }
        ]
      }
    ] : [])
  ];

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
    
    // Update URL parameters to reflect current filters
    const newSearchParams = new URLSearchParams();
    if (newFilters.status) newSearchParams.set('status', newFilters.status);
    if (newFilters.priority) newSearchParams.set('priority', newFilters.priority);
    if (newFilters.assignedTo) newSearchParams.set('assignedTo', newFilters.assignedTo);
    if (newFilters.createdBy) newSearchParams.set('createdBy', newFilters.createdBy);
    if (newFilters.search) newSearchParams.set('search', newFilters.search);
    
    setSearchParams(newSearchParams);
  };

  // Update fetch logic to always use backend pagination
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      let params = { 
        page, 
        size: rowsPerPage,
        // Include all filters in the API call
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.assignedTo && { assignedToId: filters.assignedTo }),
        ...(filters.createdBy && { createdById: filters.createdBy }),
        ...(filters.search && { search: filters.search })
      };
      
      let ticketsData;
      let allTicketsData;
      
      if (user?.role === 'TECHNICIAN') {
        // For technicians, always fetch both assigned and all tickets
        const technicianId = user?.userId || user?.id;
        ticketsData = await ticketService.getTechnicianTickets(technicianId, params);
        allTicketsData = await ticketService.getTickets(params);
        
        // Keep unassigned tickets for backward compatibility
        if (TECHNICIAN_PERMISSIONS.viewUnassignedTickets) {
          const unassignedData = await ticketService.getUnassignedTicketsWithFilters(params);
          setUnassignedTickets(Array.isArray(unassignedData) ? unassignedData : (unassignedData?.content ? unassignedData.content : []));
        }
      } else if (user?.role === 'ADMIN') {
        ticketsData = await ticketService.getTickets(params);
        allTicketsData = ticketsData; // Same data for admins
      } else {
        const employeeId = user?.userId || user?.id;
        ticketsData = await ticketService.getTickets({ ...params, createdBy: employeeId });
        allTicketsData = ticketsData; // Same data for employees
      }
      
      // Support both array and paginated response
      let ticketsArray = Array.isArray(ticketsData) ? ticketsData : (ticketsData?.content ? ticketsData.content : (ticketsData?.data ? ticketsData.data : []));
      let allTicketsArray = Array.isArray(allTicketsData) ? allTicketsData : (allTicketsData?.content ? allTicketsData.content : (allTicketsData?.data ? allTicketsData.data : []));
      
      setTickets(ticketsArray);
      setAllTickets(allTicketsArray);
      setTotalCount(ticketsData?.totalElements || ticketsArray.length);
      setLoading(false);
    };
    if (user) fetchTickets();
  }, [user, page, rowsPerPage, filters, tabValue]);

  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <PriorityHigh sx={{ color: 'error.main' }} />;
      case 'MEDIUM':
        return <WarningAmber sx={{ color: 'warning.main' }} />;
      case 'LOW':
        return <LowPriority sx={{ color: 'success.main' }} />;
      default:
        return <WarningAmber sx={{ color: 'warning.main' }} />;
    }
  };

  // Handle pagination changes
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
  };

  // Determine dynamic title and subtitle based on filters and user role
  const getPageTitle = () => {
    if (user?.role === 'TECHNICIAN') {
      return 'Ticket Management';
    }
    return 'Ticket Management';
  };

  const getPageSubtitle = () => {
    if (user?.role === 'TECHNICIAN') {
      return 'Manage your assigned tickets and view all tickets in the system';
    } else if (user?.role === 'ADMIN') {
      return 'Manage all system tickets, assignments, and escalations';
    } else {
      return 'View and manage your submitted tickets';
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
    <PageLayout
      title={getPageTitle()}
      subtitle={getPageSubtitle()}
      loading={loading}
      error={error}
      actions={
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Only show Create Ticket for Admins and Employees */}
          {(user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateFormOpen(true)}
            >
              Create Ticket
            </Button>
          )}
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>
      }
    >
      {/* Enhanced Filters */}
      <EnhancedFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        filterConfigs={filterConfigs}
        loading={loading}
        searchPlaceholder="Search tickets by title, description, or category..."
      />

      {/* Tabs for Technicians */}
      {user?.role === 'TECHNICIAN' && TECHNICIAN_PERMISSIONS.viewUnassignedTickets && (
        <Box sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`Technician Assigned Tickets (${filteredTickets.length})`} />
            <Tab label={`All Tickets (${filteredAllTickets.length})`} />
          </Tabs>
        </Box>
      )}

      {/* Tickets Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>{ticket.title}</TableCell>
                    <TableCell>
                      <Chip 
                        icon={getPriorityIcon(ticket.priority)}
                        label={PRIORITY_LABELS[ticket.priority] || ticket.priority} 
                        color={getPriorityColor(ticket.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={STATUS_LABELS[ticket.status] || ticket.status} 
                        color={getStatusColor(ticket.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{ticket.category}</TableCell>
                    <TableCell>{ticket.createdBy?.fullName || ticket.createdBy?.name || 'Unknown'}</TableCell>
                    <TableCell>{ticket.assignedTo?.fullName || ticket.assignedTo?.name || 'Unassigned'}</TableCell>
                    <TableCell>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleDialogOpen('view', ticket)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {(user?.role === 'ADMIN' || ticket.assignedTo?.id === (user?.userId || user?.id)) && (
                          <IconButton
                            size="small"
                            onClick={() => handleDialogOpen('edit', ticket)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        
                        {user?.role === 'TECHNICIAN' && ticket.assignedTo?.id === (user?.userId || user?.id) && (
                          <IconButton
                            size="small"
                            onClick={() => handleDialogOpen('escalate', ticket)}
                            color="secondary"
                          >
                            <WarningAmber />
                          </IconButton>
                        )}

                        {/* Technician-specific actions - only for their own tickets */}
                        {user?.role === 'TECHNICIAN' && ticket.assignedTo?.id === user?.id && (
                          <>
                            {ticket.status === 'CLOSED' && TECHNICIAN_PERMISSIONS.reopenTickets && (
                              <Tooltip title="Reopen Ticket">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDialogOpen('reopen', ticket)}
                                >
                                  <ReplayIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {ticket.status !== 'CLOSED' && ticket.status !== 'ESCALATED' && TECHNICIAN_PERMISSIONS.escalateTickets && (
                              <Tooltip title="Escalate Ticket">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDialogOpen('escalate', ticket)}
                                >
                                  <WarningAmber />
                                </IconButton>
                              </Tooltip>
                            )}
                          </>
                        )}

                        {/* Admin actions - can modify any ticket */}
                        {user?.role === 'ADMIN' && (
                          <>
                            <Tooltip title="Assign Ticket">
                              <IconButton
                                size="small"
                                onClick={() => handleDialogOpen('assign', ticket)}
                              >
                                <AssignmentIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Delete Ticket">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDialogOpen('delete', ticket)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                            
                            {ticket.status === 'CLOSED' && (
                              <Tooltip title="Reopen Ticket">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDialogOpen('reopen', ticket)}
                                >
                                  <ReplayIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {ticket.status !== 'CLOSED' && ticket.status !== 'ESCALATED' && (
                              <Tooltip title="Escalate Ticket">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDialogOpen('escalate', ticket)}
                                >
                                  <WarningAmber />
                                </IconButton>
                              </Tooltip>
                            )}
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Enhanced Pagination */}
        <EnhancedPagination
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
          loading={loading}
          showInfo={true}
          showPageSizeSelector={true}
        />
      </Paper>

      {/* Dialogs */}
      {/* View Ticket Dialog */}
      <Dialog open={dialogOpen && dialogType === 'view'} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Ticket Details</DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box>
              <Typography variant="h6">{selectedTicket.title}</Typography>
              <Typography color="textSecondary" gutterBottom>
                {selectedTicket.description}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip label={`Priority: ${PRIORITY_LABELS[selectedTicket.priority] || selectedTicket.priority}`} sx={{ mr: 1 }} />
                <Chip label={`Status: ${STATUS_LABELS[selectedTicket.status] || selectedTicket.status}`} sx={{ mr: 1 }} />
                <Chip label={`Category: ${selectedTicket.category}`} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Ticket Dialog */}
      <Dialog open={dialogOpen && dialogType === 'edit'} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                {priorities.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {PRIORITY_LABELS[priority] || priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {STATUS_LABELS[status] || status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleUpdateTicket} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Escalate Ticket Dialog */}
      <Dialog open={dialogOpen && dialogType === 'escalate'} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Escalate Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Reason for Escalation"
              value={escalationData.reason}
              onChange={(e) => setEscalationData({ ...escalationData, reason: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Additional Details"
              value={escalationData.details}
              onChange={(e) => setEscalationData({ ...escalationData, details: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleEscalateTicket} variant="contained" color="warning">
            Escalate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reopen Ticket Dialog */}
      <Dialog open={dialogOpen && dialogType === 'reopen'} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Reopen Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Reason for Reopening"
              value={reopenData.reason}
              onChange={(e) => setReopenData({ ...reopenData, reason: e.target.value })}
              multiline
              rows={4}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleReopenTicket} variant="contained" color="primary">
            Reopen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Ticket Dialog */}
      <Dialog open={dialogOpen && dialogType === 'delete'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Ticket</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the ticket "{selectedTicket?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteTicket} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Ticket Dialog */}
      <Dialog open={dialogOpen && dialogType === 'assign'} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Assign Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="h6">{selectedTicket?.title}</Typography>
            <FormControl fullWidth>
              <InputLabel>Assign to Technician</InputLabel>
              <Select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                label="Assign to Technician"
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users.filter(u => u.role === 'TECHNICIAN').map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.fullName || user.name} ({user.department})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleAssignTicket} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Ticket Form */}
      <CreateTicketForm
        open={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
        onTicketCreated={(newTicket) => {
          setTickets([...tickets, newTicket]);
          setCreateFormOpen(false);
        }}
      />
    </PageLayout>
  );
};

export default Tickets; 