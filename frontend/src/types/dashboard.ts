// Dashboard statistics types for DGH HelpDesk

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  technicianUsers: number;
  employeeUsers: number;
}

export interface EquipmentStatistics {
  totalEquipment: number;
  onlineEquipment: number;
  offlineEquipment: number;
  managedEquipment: number;
}

export interface TicketStatistics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  unassignedTickets: number;
  escalatedTickets: number;
}

export interface DashboardStatistics {
  userStatistics: UserStatistics;
  equipmentStatistics: EquipmentStatistics;
  ticketStatistics: TicketStatistics;
} 