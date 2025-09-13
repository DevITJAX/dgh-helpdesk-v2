// Technician permissions and workflow configuration
export const TECHNICIAN_PERMISSIONS = {
  // View & Manage
  viewAssignedTickets: true,
  viewUnassignedTickets: true,        // NEW: See unassigned tickets
  viewAllTickets: false,              // Only admins see all
  
  // Actions
  updateTicketStatus: true,
  addComments: true,
  createTickets: true,                // NEW: Create tickets for users
  assignTicketsToSelf: true,          // NEW: Self-assignment
  reassignTickets: false,             // Only admins can reassign
  
  // Advanced Features
  escalateTickets: true,              // NEW: Escalate to admin
  closeTickets: true,
  reopenTickets: true,                // NEW: Reopen closed tickets
  addAttachments: true,               // NEW: File uploads
  addTimeTracking: true               // NEW: Track work time
};

// Ticket workflow states for technicians
export const TECHNICIAN_WORKFLOW_STATES = {
  UNASSIGNED: 'Can assign to self',
  ASSIGNED: 'Can start working',
  IN_PROGRESS: 'Can update progress',
  PENDING_USER: 'Waiting for user response',
  PENDING_PARTS: 'Waiting for parts/supplies',
  RESOLVED: 'Can close or reopen',
  CLOSED: 'Can reopen if needed',
  ESCALATED: 'Sent to admin for review'
};

// Equipment permissions for technicians
export const TECHNICIAN_EQUIPMENT_PERMISSIONS = {
  // View & Search
  viewAllEquipment: true,
  searchEquipment: true,
  filterByLocation: true,
  filterByType: true,
  
  // Management
  updateEquipmentStatus: true,        // ONLINE/OFFLINE/MAINTENANCE
  addEquipmentNotes: true,            // NEW: Maintenance notes
  markEquipmentForMaintenance: true,  // NEW: Schedule maintenance
  updateEquipmentLocation: true,      // NEW: Asset tracking
  
  // Network Operations
  performNetworkScan: true,           // Already implemented
  scanSpecificDevice: true,           // Already implemented
  pingEquipment: true,                // NEW: Quick connectivity test
  viewEquipmentDetails: true,         // NEW: Detailed SNMP info
  
  // Maintenance
  createMaintenanceTicket: true,      // NEW: Auto-create tickets
  scheduleMaintenance: true,          // NEW: Preventive maintenance
  updateInventory: true               // NEW: Add/remove equipment
}; 