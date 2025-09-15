package ma.gov.dgh.helpdesk.controller;

import ma.gov.dgh.helpdesk.service.EquipmentService;
import ma.gov.dgh.helpdesk.service.TicketService;
import ma.gov.dgh.helpdesk.service.UserService;
import ma.gov.dgh.helpdesk.entity.User;
import ma.gov.dgh.helpdesk.entity.Ticket;
import ma.gov.dgh.helpdesk.entity.Equipment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

/**
 * REST Controller for Dashboard operations and statistics
 */
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:4200", "http://dgh-helpdesk-frontend-westus2.westus2.azurecontainer.io"})
public class DashboardController {
    
    private final UserService userService;
    private final EquipmentService equipmentService;
    private final TicketService ticketService;
    
    @Autowired
    public DashboardController(UserService userService, EquipmentService equipmentService, TicketService ticketService) {
        this.userService = userService;
        this.equipmentService = equipmentService;
        this.ticketService = ticketService;
    }
    
    /**
     * Get overall dashboard statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<DashboardStatistics> getDashboardStatistics() {
        UserService.UserStatistics userStats = userService.getUserStatistics();
        EquipmentService.EquipmentStatistics equipmentStats = equipmentService.getEquipmentStatistics();
        TicketService.TicketStatistics ticketStats = ticketService.getTicketStatistics();
        
        DashboardStatistics dashboardStats = new DashboardStatistics(userStats, equipmentStats, ticketStats);
        return ResponseEntity.ok(dashboardStats);
    }
    
    /**
     * Get technician-specific statistics
     */
    @GetMapping("/technician/{technicianId}/statistics")
    public ResponseEntity<TechnicianStatistics> getTechnicianStatistics(@PathVariable Long technicianId) {
        Optional<User> technician = userService.findById(technicianId);
        if (technician.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Get tickets assigned to this technician
        List<Ticket> assignedTickets = ticketService.findByAssignedTo(technician.get());
        
        // Calculate statistics
        long totalAssigned = assignedTickets.size();
        long openTickets = assignedTickets.stream().filter(t -> t.getStatus().name().equals("OPEN")).count();
        long inProgressTickets = assignedTickets.stream().filter(t -> t.getStatus().name().equals("IN_PROGRESS")).count();
        long resolvedTickets = assignedTickets.stream().filter(t -> 
            t.getStatus().name().equals("RESOLVED") || t.getStatus().name().equals("CLOSED")).count();
        
        // Get unassigned tickets
        List<Ticket> unassignedTickets = ticketService.findUnassignedTickets();
        
        // Get equipment alerts (offline/maintenance equipment)
        List<Equipment> allEquipment = equipmentService.findAll();
        long equipmentAlerts = allEquipment.stream()
            .filter(e -> e.getStatus().name().equals("OFFLINE") || e.getStatus().name().equals("MAINTENANCE"))
            .count();
        
        TechnicianStatistics stats = new TechnicianStatistics(
            totalAssigned,
            openTickets,
            inProgressTickets,
            resolvedTickets,
            unassignedTickets.size(),
            equipmentAlerts
        );
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get technician's workload overview
     */
    @GetMapping("/technician/{technicianId}/workload")
    public ResponseEntity<TechnicianWorkload> getTechnicianWorkload(@PathVariable Long technicianId) {
        Optional<User> technician = userService.findById(technicianId);
        if (technician.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Ticket> assignedTickets = ticketService.findByAssignedTo(technician.get());
        
        // Group tickets by priority
        Map<String, Long> ticketsByPriority = assignedTickets.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                t -> t.getPriority().name(),
                java.util.stream.Collectors.counting()
            ));
        
        // Group tickets by category
        Map<String, Long> ticketsByCategory = assignedTickets.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                t -> t.getCategory().name(),
                java.util.stream.Collectors.counting()
            ));
        
        TechnicianWorkload workload = new TechnicianWorkload(
            assignedTickets.size(),
            ticketsByPriority,
            ticketsByCategory
        );
        
        return ResponseEntity.ok(workload);
    }
    
    /**
     * Get technician's performance metrics
     */
    @GetMapping("/technician/{technicianId}/performance")
    public ResponseEntity<TechnicianPerformance> getTechnicianPerformance(
            @PathVariable Long technicianId,
            @RequestParam(defaultValue = "30") int period) {
        
        Optional<User> technician = userService.findById(technicianId);
        if (technician.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Ticket> assignedTickets = ticketService.findByAssignedTo(technician.get());
        
        // Calculate performance metrics
        long totalTickets = assignedTickets.size();
        long resolvedTickets = assignedTickets.stream()
            .filter(t -> t.getStatus().name().equals("RESOLVED") || t.getStatus().name().equals("CLOSED"))
            .count();
        
        double resolutionRate = totalTickets > 0 ? (double) resolvedTickets / totalTickets * 100 : 0;
        
        // Calculate average resolution time (simplified)
        double avgResolutionTime = assignedTickets.stream()
            .filter(t -> t.getResolvedAt() != null && t.getCreatedAt() != null)
            .mapToLong(t -> java.time.Duration.between(t.getCreatedAt(), t.getResolvedAt()).toHours())
            .average()
            .orElse(0.0);
        
        TechnicianPerformance performance = new TechnicianPerformance(
            totalTickets,
            resolvedTickets,
            resolutionRate,
            avgResolutionTime
        );
        
        return ResponseEntity.ok(performance);
    }
    
    /**
     * Get technician's assigned equipment statistics
     */
    @GetMapping("/technician/{technicianId}/equipment-stats")
    public ResponseEntity<TechnicianEquipmentStats> getTechnicianEquipmentStats(@PathVariable Long technicianId) {
        Optional<User> technician = userService.findById(technicianId);
        if (technician.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Equipment> allEquipment = equipmentService.findAll();
        
        // Calculate equipment statistics
        long totalEquipment = allEquipment.size();
        long onlineEquipment = allEquipment.stream().filter(e -> e.getStatus().name().equals("ONLINE")).count();
        long offlineEquipment = allEquipment.stream().filter(e -> e.getStatus().name().equals("OFFLINE")).count();
        long maintenanceEquipment = allEquipment.stream().filter(e -> e.getStatus().name().equals("MAINTENANCE")).count();
        
        TechnicianEquipmentStats stats = new TechnicianEquipmentStats(
            totalEquipment,
            onlineEquipment,
            offlineEquipment,
            maintenanceEquipment
        );
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get priority queue for technician
     */
    @GetMapping("/technician/{technicianId}/priority-queue")
    public ResponseEntity<List<Ticket>> getTechnicianPriorityQueue(@PathVariable Long technicianId) {
        Optional<User> technician = userService.findById(technicianId);
        if (technician.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Ticket> assignedTickets = ticketService.findByAssignedTo(technician.get());
        
        // Sort by priority (CRITICAL, HIGH, MEDIUM, LOW) and then by creation date
        assignedTickets.sort((t1, t2) -> {
            int priorityCompare = t2.getPriority().getLevel() - t1.getPriority().getLevel();
            if (priorityCompare != 0) {
                return priorityCompare;
            }
            return t1.getCreatedAt().compareTo(t2.getCreatedAt());
        });
        
        return ResponseEntity.ok(assignedTickets);
    }
    
    /**
     * Get technician's time tracking summary
     */
    @GetMapping("/technician/{technicianId}/time-tracking")
    public ResponseEntity<TechnicianTimeTracking> getTechnicianTimeTracking(
            @PathVariable Long technicianId,
            @RequestParam(defaultValue = "7") int period) {
        
        Optional<User> technician = userService.findById(technicianId);
        if (technician.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Ticket> assignedTickets = ticketService.findByAssignedTo(technician.get());
        
        // Calculate time tracking metrics (simplified)
        long totalHours = assignedTickets.stream()
            .filter(t -> t.getActualHours() != null)
            .mapToLong(Ticket::getActualHours)
            .sum();
        
        long estimatedHours = assignedTickets.stream()
            .filter(t -> t.getEstimatedHours() != null)
            .mapToLong(Ticket::getEstimatedHours)
            .sum();
        
        TechnicianTimeTracking timeTracking = new TechnicianTimeTracking(
            totalHours,
            estimatedHours,
            period
        );
        
        return ResponseEntity.ok(timeTracking);
    }
    
    /**
     * Get equipment alerts for technician's area
     */
    @GetMapping("/technician/{technicianId}/equipment-alerts")
    public ResponseEntity<List<Equipment>> getTechnicianEquipmentAlerts(@PathVariable Long technicianId) {
        Optional<User> technician = userService.findById(technicianId);
        if (technician.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Equipment> allEquipment = equipmentService.findAll();
        
        // Filter for equipment alerts (offline/maintenance)
        List<Equipment> alerts = allEquipment.stream()
            .filter(e -> e.getStatus().name().equals("OFFLINE") || e.getStatus().name().equals("MAINTENANCE"))
            .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(alerts);
    }
    
    /**
     * Get recent activity for technician
     */
    @GetMapping("/technician/{technicianId}/recent-activity")
    public ResponseEntity<List<Ticket>> getTechnicianRecentActivity(
            @PathVariable Long technicianId,
            @RequestParam(defaultValue = "10") int limit) {
        
        Optional<User> technician = userService.findById(technicianId);
        if (technician.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Ticket> assignedTickets = ticketService.findByAssignedTo(technician.get());
        
        // Sort by updated date (most recent first) and limit results
        assignedTickets.sort((t1, t2) -> t2.getUpdatedAt().compareTo(t1.getUpdatedAt()));
        
        if (assignedTickets.size() > limit) {
            assignedTickets = assignedTickets.subList(0, limit);
        }
        
        return ResponseEntity.ok(assignedTickets);
    }
    
    /**
     * Get user statistics
     */
    @GetMapping("/users/statistics")
    public ResponseEntity<UserService.UserStatistics> getUserStatistics() {
        UserService.UserStatistics statistics = userService.getUserStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Get equipment statistics
     */
    @GetMapping("/equipment/statistics")
    public ResponseEntity<EquipmentService.EquipmentStatistics> getEquipmentStatistics() {
        EquipmentService.EquipmentStatistics statistics = equipmentService.getEquipmentStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Get ticket statistics
     */
    @GetMapping("/tickets/statistics")
    public ResponseEntity<TicketService.TicketStatistics> getTicketStatistics() {
        TicketService.TicketStatistics statistics = ticketService.getTicketStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    // Inner classes for technician-specific responses
    
    public static class TechnicianStatistics {
        private final long totalAssigned;
        private final long openTickets;
        private final long inProgressTickets;
        private final long resolvedTickets;
        private final long unassignedTickets;
        private final long equipmentAlerts;
        
        public TechnicianStatistics(long totalAssigned, long openTickets, long inProgressTickets,
                                 long resolvedTickets, long unassignedTickets, long equipmentAlerts) {
            this.totalAssigned = totalAssigned;
            this.openTickets = openTickets;
            this.inProgressTickets = inProgressTickets;
            this.resolvedTickets = resolvedTickets;
            this.unassignedTickets = unassignedTickets;
            this.equipmentAlerts = equipmentAlerts;
        }
        
        // Getters
        public long getTotalAssigned() { return totalAssigned; }
        public long getOpenTickets() { return openTickets; }
        public long getInProgressTickets() { return inProgressTickets; }
        public long getResolvedTickets() { return resolvedTickets; }
        public long getUnassignedTickets() { return unassignedTickets; }
        public long getEquipmentAlerts() { return equipmentAlerts; }
    }
    
    public static class TechnicianWorkload {
        private final long totalTickets;
        private final Map<String, Long> ticketsByPriority;
        private final Map<String, Long> ticketsByCategory;
        
        public TechnicianWorkload(long totalTickets, Map<String, Long> ticketsByPriority,
                                Map<String, Long> ticketsByCategory) {
            this.totalTickets = totalTickets;
            this.ticketsByPriority = ticketsByPriority;
            this.ticketsByCategory = ticketsByCategory;
        }
        
        // Getters
        public long getTotalTickets() { return totalTickets; }
        public Map<String, Long> getTicketsByPriority() { return ticketsByPriority; }
        public Map<String, Long> getTicketsByCategory() { return ticketsByCategory; }
    }
    
    public static class TechnicianPerformance {
        private final long totalTickets;
        private final long resolvedTickets;
        private final double resolutionRate;
        private final double avgResolutionTime;
        
        public TechnicianPerformance(long totalTickets, long resolvedTickets,
                                  double resolutionRate, double avgResolutionTime) {
            this.totalTickets = totalTickets;
            this.resolvedTickets = resolvedTickets;
            this.resolutionRate = resolutionRate;
            this.avgResolutionTime = avgResolutionTime;
        }
        
        // Getters
        public long getTotalTickets() { return totalTickets; }
        public long getResolvedTickets() { return resolvedTickets; }
        public double getResolutionRate() { return resolutionRate; }
        public double getAvgResolutionTime() { return avgResolutionTime; }
    }
    
    public static class TechnicianEquipmentStats {
        private final long totalEquipment;
        private final long onlineEquipment;
        private final long offlineEquipment;
        private final long maintenanceEquipment;
        
        public TechnicianEquipmentStats(long totalEquipment, long onlineEquipment,
                                     long offlineEquipment, long maintenanceEquipment) {
            this.totalEquipment = totalEquipment;
            this.onlineEquipment = onlineEquipment;
            this.offlineEquipment = offlineEquipment;
            this.maintenanceEquipment = maintenanceEquipment;
        }
        
        // Getters
        public long getTotalEquipment() { return totalEquipment; }
        public long getOnlineEquipment() { return onlineEquipment; }
        public long getOfflineEquipment() { return offlineEquipment; }
        public long getMaintenanceEquipment() { return maintenanceEquipment; }
    }
    
    public static class TechnicianTimeTracking {
        private final long totalHours;
        private final long estimatedHours;
        private final int period;
        
        public TechnicianTimeTracking(long totalHours, long estimatedHours, int period) {
            this.totalHours = totalHours;
            this.estimatedHours = estimatedHours;
            this.period = period;
        }
        
        // Getters
        public long getTotalHours() { return totalHours; }
        public long getEstimatedHours() { return estimatedHours; }
        public int getPeriod() { return period; }
    }
    
    /**
     * Inner class for combined dashboard statistics
     */
    public static class DashboardStatistics {
        private final UserService.UserStatistics userStatistics;
        private final EquipmentService.EquipmentStatistics equipmentStatistics;
        private final TicketService.TicketStatistics ticketStatistics;
        
        public DashboardStatistics(UserService.UserStatistics userStatistics,
                                 EquipmentService.EquipmentStatistics equipmentStatistics,
                                 TicketService.TicketStatistics ticketStatistics) {
            this.userStatistics = userStatistics;
            this.equipmentStatistics = equipmentStatistics;
            this.ticketStatistics = ticketStatistics;
        }
        
        public UserService.UserStatistics getUserStatistics() {
            return userStatistics;
        }
        
        public EquipmentService.EquipmentStatistics getEquipmentStatistics() {
            return equipmentStatistics;
        }
        
        public TicketService.TicketStatistics getTicketStatistics() {
            return ticketStatistics;
        }
    }
}
