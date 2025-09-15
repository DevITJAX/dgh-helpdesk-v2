package ma.gov.dgh.helpdesk.controller;

import ma.gov.dgh.helpdesk.entity.*;
import ma.gov.dgh.helpdesk.service.TicketService;
import ma.gov.dgh.helpdesk.service.UserService;
import ma.gov.dgh.helpdesk.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST Controller for Ticket operations
 */
@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = {
    "http://localhost:3000", 
    "http://localhost:4200",
    "http://20.124.43.230",
    "http://20.124.43.230:80",
    "https://dgh-helpdesk-h8ahdqhmhtdhg4bh.centralus-01.azurewebsites.net",
    "http://dgh-frontend-unique.eastus.azurecontainer.io",
    "http://dgh-helpdesk-frontend-westus2.westus2.azurecontainer.io"
})
public class TicketController {
    
    private final TicketService ticketService;
    private final UserService userService;
    private final TicketRepository ticketRepository;
    
    @Autowired
    public TicketController(TicketService ticketService, UserService userService, TicketRepository ticketRepository) {
        this.ticketService = ticketService;
        this.userService = userService;
        this.ticketRepository = ticketRepository;
    }
    
    /**
     * DTO for ticket responses with user information
     */
    public static class TicketDTO {
        private Long id;
        private String title;
        private String description;
        private TicketPriority priority;
        private TicketStatus status;
        private TicketCategory category;
        private UserDTO createdBy;
        private UserDTO assignedTo;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime resolvedAt;
        private LocalDateTime dueDate;
        private String resolution;
        private Integer estimatedHours;
        private Integer actualHours;
        private Integer customerSatisfaction;
        private Boolean isEscalated;
        private String escalationReason;
        
        public TicketDTO(Ticket ticket) {
            this.id = ticket.getId();
            this.title = ticket.getTitle();
            this.description = ticket.getDescription();
            this.priority = ticket.getPriority();
            this.status = ticket.getStatus();
            this.category = ticket.getCategory();
            this.createdBy = ticket.getCreatedBy() != null ? new UserDTO(ticket.getCreatedBy()) : null;
            this.assignedTo = ticket.getAssignedTo() != null ? new UserDTO(ticket.getAssignedTo()) : null;
            this.createdAt = ticket.getCreatedAt();
            this.updatedAt = ticket.getUpdatedAt();
            this.resolvedAt = ticket.getResolvedAt();
            this.dueDate = ticket.getDueDate();
            this.resolution = ticket.getResolution();
            this.estimatedHours = ticket.getEstimatedHours();
            this.actualHours = ticket.getActualHours();
            this.customerSatisfaction = ticket.getCustomerSatisfaction();
            this.isEscalated = ticket.getIsEscalated();
            this.escalationReason = ticket.getEscalationReason();
        }
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public TicketPriority getPriority() { return priority; }
        public void setPriority(TicketPriority priority) { this.priority = priority; }
        
        public TicketStatus getStatus() { return status; }
        public void setStatus(TicketStatus status) { this.status = status; }
        
        public TicketCategory getCategory() { return category; }
        public void setCategory(TicketCategory category) { this.category = category; }
        
        public UserDTO getCreatedBy() { return createdBy; }
        public void setCreatedBy(UserDTO createdBy) { this.createdBy = createdBy; }
        
        public UserDTO getAssignedTo() { return assignedTo; }
        public void setAssignedTo(UserDTO assignedTo) { this.assignedTo = assignedTo; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
        
        public LocalDateTime getResolvedAt() { return resolvedAt; }
        public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
        
        public LocalDateTime getDueDate() { return dueDate; }
        public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
        
        public String getResolution() { return resolution; }
        public void setResolution(String resolution) { this.resolution = resolution; }
        
        public Integer getEstimatedHours() { return estimatedHours; }
        public void setEstimatedHours(Integer estimatedHours) { this.estimatedHours = estimatedHours; }
        
        public Integer getActualHours() { return actualHours; }
        public void setActualHours(Integer actualHours) { this.actualHours = actualHours; }
        
        public Integer getCustomerSatisfaction() { return customerSatisfaction; }
        public void setCustomerSatisfaction(Integer customerSatisfaction) { this.customerSatisfaction = customerSatisfaction; }
        
        public Boolean getIsEscalated() { return isEscalated; }
        public void setIsEscalated(Boolean isEscalated) { this.isEscalated = isEscalated; }
        
        public String getEscalationReason() { return escalationReason; }
        public void setEscalationReason(String escalationReason) { this.escalationReason = escalationReason; }
    }
    
    /**
     * DTO for user information in ticket responses
     */
    public static class UserDTO {
        private Long id;
        private String ldapUsername;
        private String email;
        private String fullName;
        private String department;
        private UserRole role;
        private Boolean isActive;
        
        public UserDTO(User user) {
            this.id = user.getId();
            this.ldapUsername = user.getLdapUsername();
            this.email = user.getEmail();
            this.fullName = user.getFullName();
            this.department = user.getDepartment();
            this.role = user.getRole();
            this.isActive = user.getIsActive();
        }
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getLdapUsername() { return ldapUsername; }
        public void setLdapUsername(String ldapUsername) { this.ldapUsername = ldapUsername; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        
        public UserRole getRole() { return role; }
        public void setRole(UserRole role) { this.role = role; }
        
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    }
    
    /**
     * Get all tickets with pagination and filtering
     */
    @GetMapping
    public ResponseEntity<Page<TicketDTO>> getAllTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) Long createdById,
            @RequestParam(required = false) Long assignedToId,
            @RequestParam(required = false) Long equipmentId) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        User createdBy = createdById != null ? userService.findById(createdById).orElse(null) : null;
        User assignedTo = assignedToId != null ? userService.findById(assignedToId).orElse(null) : null;
        
        Page<Ticket> tickets = ticketService.findTicketsWithFilters(
            search, status, priority, category, createdBy, assignedTo, equipmentId, pageable);
        
        // Convert to DTOs
        Page<TicketDTO> ticketDTOs = tickets.map(TicketDTO::new);
        
        return ResponseEntity.ok(ticketDTOs);
    }
    
    /**
     * Get ticket by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO> getTicketById(@PathVariable Long id) {
        Optional<Ticket> ticket = ticketService.findById(id);
        return ticket.map(t -> ResponseEntity.ok(new TicketDTO(t)))
                    .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get tickets by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TicketDTO>> getTicketsByStatus(@PathVariable TicketStatus status) {
        List<Ticket> tickets = ticketService.findByStatus(status);
        List<TicketDTO> ticketDTOs = tickets.stream()
            .map(TicketDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ticketDTOs);
    }
    
    /**
     * Get tickets by priority
     */
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<TicketDTO>> getTicketsByPriority(@PathVariable TicketPriority priority) {
        List<Ticket> tickets = ticketService.findByPriority(priority);
        List<TicketDTO> ticketDTOs = tickets.stream()
            .map(TicketDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ticketDTOs);
    }
    
    /**
     * Get tickets by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<TicketDTO>> getTicketsByCategory(@PathVariable TicketCategory category) {
        List<Ticket> tickets = ticketService.findByCategory(category);
        List<TicketDTO> ticketDTOs = tickets.stream()
            .map(TicketDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ticketDTOs);
    }
    
    /**
     * Get tickets created by user
     */
    @GetMapping("/created-by/{userId}")
    public ResponseEntity<List<TicketDTO>> getTicketsCreatedByUser(@PathVariable Long userId) {
        Optional<User> user = userService.findById(userId);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<Ticket> tickets = ticketService.findByCreatedBy(user.get());
        List<TicketDTO> ticketDTOs = tickets.stream()
            .map(TicketDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ticketDTOs);
    }
    
    /**
     * Get tickets assigned to user
     */
    @GetMapping("/assigned-to/{userId}")
    public ResponseEntity<List<TicketDTO>> getTicketsAssignedToUser(@PathVariable Long userId) {
        Optional<User> user = userService.findById(userId);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<Ticket> tickets = ticketService.findByAssignedTo(user.get());
        List<TicketDTO> ticketDTOs = tickets.stream()
            .map(TicketDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ticketDTOs);
    }
    
    /**
     * Get unassigned tickets
     */
    @GetMapping("/unassigned")
    public ResponseEntity<List<TicketDTO>> getUnassignedTickets() {
        List<Ticket> tickets = ticketService.findUnassignedTickets();
        List<TicketDTO> ticketDTOs = tickets.stream()
            .map(TicketDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ticketDTOs);
    }
    
    /**
     * Get open tickets
     */
    @GetMapping("/open")
    public ResponseEntity<List<TicketDTO>> getOpenTickets() {
        List<Ticket> tickets = ticketService.findOpenTickets();
        List<TicketDTO> ticketDTOs = tickets.stream()
            .map(TicketDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ticketDTOs);
    }
    
    /**
     * Get overdue tickets
     */
    @GetMapping("/overdue")
    public ResponseEntity<List<TicketDTO>> getOverdueTickets() {
        List<Ticket> tickets = ticketService.findOverdueTickets();
        List<TicketDTO> ticketDTOs = tickets.stream()
            .map(TicketDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ticketDTOs);
    }
    
    /**
     * Get escalated tickets
     */
    @GetMapping("/escalated")
    public ResponseEntity<List<TicketDTO>> getEscalatedTickets() {
        List<Ticket> tickets = ticketService.findEscalatedTickets();
        List<TicketDTO> ticketDTOs = tickets.stream()
            .map(TicketDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ticketDTOs);
    }
    
    /**
     * Get critical open tickets
     */
    @GetMapping("/critical")
    public ResponseEntity<List<TicketDTO>> getCriticalOpenTickets() {
        List<Ticket> tickets = ticketService.findCriticalOpenTickets();
        List<TicketDTO> ticketDTOs = tickets.stream()
            .map(TicketDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ticketDTOs);
    }
    
    /**
     * Create a new ticket
     */
    @PostMapping
    public ResponseEntity<TicketDTO> createTicket(@Valid @RequestBody TicketCreateRequest request) {
        try {
            User createdBy = userService.findById(request.getCreatedById())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Equipment equipment = null;
            if (request.getEquipmentId() != null) {
                // You would need to inject EquipmentService here if you have one
                // equipment = equipmentService.findById(request.getEquipmentId()).orElse(null);
            }
            
            Ticket ticket = new Ticket();
            ticket.setTitle(request.getTitle());
            ticket.setDescription(request.getDescription());
            ticket.setPriority(request.getPriority());
            ticket.setCategory(request.getCategory());
            ticket.setCreatedBy(createdBy);
            ticket.setEquipment(equipment);
            
            Ticket savedTicket = ticketService.createTicket(ticket);
            return ResponseEntity.status(HttpStatus.CREATED).body(new TicketDTO(savedTicket));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update an existing ticket
     */
    @PutMapping("/{id}")
    public ResponseEntity<TicketDTO> updateTicket(@PathVariable Long id, @Valid @RequestBody TicketUpdateRequest request) {
        Optional<Ticket> existingTicket = ticketService.findById(id);
        if (existingTicket.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Ticket ticket = existingTicket.get();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setCategory(request.getCategory());
        ticket.setStatus(request.getStatus());
        
        if (request.getAssignedToId() != null) {
            Optional<User> assignedTo = userService.findById(request.getAssignedToId());
            assignedTo.ifPresent(ticket::setAssignedTo);
        } else {
            ticket.setAssignedTo(null);
        }
        
        Ticket updatedTicket = ticketService.updateTicket(ticket);
        return ResponseEntity.ok(new TicketDTO(updatedTicket));
    }
    
    /**
     * Assign ticket to a user
     */
    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketDTO> assignTicket(@PathVariable Long id, @RequestBody AssignTicketRequest request) {
        Optional<Ticket> ticket = ticketService.findById(id);
        if (ticket.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Optional<User> assignedTo = userService.findById(request.getAssignedToId());
        if (assignedTo.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        Ticket updatedTicket = ticketService.assignTicket(id, assignedTo.get());
        return ResponseEntity.ok(new TicketDTO(updatedTicket));
    }
    
    /**
     * Change ticket status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<TicketDTO> changeTicketStatus(@PathVariable Long id, @RequestBody StatusChangeRequest request) {
        Optional<Ticket> ticket = ticketService.findById(id);
        if (ticket.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Ticket updatedTicket = ticketService.changeStatus(id, request.getStatus(), request.getComment());
        return ResponseEntity.ok(new TicketDTO(updatedTicket));
    }
    
    /**
     * Escalate ticket
     */
    @PutMapping("/{id}/escalate")
    public ResponseEntity<TicketDTO> escalateTicket(@PathVariable Long id, @RequestBody EscalateTicketRequest request) {
        Optional<Ticket> ticket = ticketService.findById(id);
        if (ticket.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Ticket updatedTicket = ticketService.escalateTicket(id, request.getReason());
        return ResponseEntity.ok(new TicketDTO(updatedTicket));
    }
    
    /**
     * Add comment to ticket
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addComment(@PathVariable Long id, @RequestBody AddCommentRequest request) {
        try {
            Optional<User> user = userService.findById(request.getUserId());
            if (user.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            TicketComment comment = ticketService.addComment(id, user.get(), request.getComment(), request.getIsInternal());
            return ResponseEntity.status(HttpStatus.CREATED).body(comment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get ticket comments
     */
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketComment>> getTicketComments(@PathVariable Long id) {
        try {
            List<TicketComment> comments = ticketService.getTicketComments(id);
            return ResponseEntity.ok(comments);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete ticket
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        try {
            ticketService.deleteTicket(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get ticket statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<TicketService.TicketStatistics> getTicketStatistics() {
        TicketService.TicketStatistics statistics = ticketService.getTicketStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    // Inner classes for request DTOs
    
    public static class TicketCreateRequest {
        private String title;
        private String description;
        private TicketPriority priority;
        private TicketCategory category;
        private Long createdById;
        private Long equipmentId;
        
        // Getters and setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public TicketPriority getPriority() { return priority; }
        public void setPriority(TicketPriority priority) { this.priority = priority; }
        
        public TicketCategory getCategory() { return category; }
        public void setCategory(TicketCategory category) { this.category = category; }
        
        public Long getCreatedById() { return createdById; }
        public void setCreatedById(Long createdById) { this.createdById = createdById; }
        
        public Long getEquipmentId() { return equipmentId; }
        public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }
    }
    
    public static class TicketUpdateRequest {
        private String title;
        private String description;
        private TicketPriority priority;
        private TicketCategory category;
        private TicketStatus status;
        private Long assignedToId;
        
        // Getters and setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public TicketPriority getPriority() { return priority; }
        public void setPriority(TicketPriority priority) { this.priority = priority; }
        
        public TicketCategory getCategory() { return category; }
        public void setCategory(TicketCategory category) { this.category = category; }
        
        public TicketStatus getStatus() { return status; }
        public void setStatus(TicketStatus status) { this.status = status; }
        
        public Long getAssignedToId() { return assignedToId; }
        public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }
    }
    
    public static class AssignTicketRequest {
        private Long assignedToId;
        
        public Long getAssignedToId() { return assignedToId; }
        public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }
    }
    
    public static class StatusChangeRequest {
        private TicketStatus status;
        private String comment;
        
        public TicketStatus getStatus() { return status; }
        public void setStatus(TicketStatus status) { this.status = status; }
        
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }
    
    public static class EscalateTicketRequest {
        private String reason;
        
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
    
    public static class AddCommentRequest {
        private Long userId;
        private String comment;
        private Boolean isInternal;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
        
        public Boolean getIsInternal() { return isInternal; }
        public void setIsInternal(Boolean isInternal) { this.isInternal = isInternal; }
    }
    
    /**
     * Create sample tickets for testing - GET endpoint to avoid auth issues
     */
    @GetMapping("/samples/create")
    public ResponseEntity<String> createSampleTickets() {
        try {
            // Check if we already have tickets
            long ticketCount = ticketService.countAllTickets();
            if (ticketCount > 0) {
                return ResponseEntity.ok("Sample tickets already exist. Current count: " + ticketCount + " tickets");
            }
            
            // Find the admin user (should exist from data.sql)
            Optional<User> adminUserOpt = userService.findByLdapUsername("admin");
            if (!adminUserOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Admin user not found. Please check if data.sql was executed properly.");
            }
            
            User adminUser = adminUserOpt.get();
            
            // Create additional sample tickets
            Ticket ticket1 = new Ticket("Network Connectivity Issue", "WiFi keeps disconnecting every few minutes in conference room", adminUser);
            ticket1.setPriority(TicketPriority.HIGH);
            ticket1.setCategory(TicketCategory.NETWORK);
            ticketService.createTicket(ticket1);
            
            Ticket ticket2 = new Ticket("Software Installation Request", "Need Microsoft Teams installed on new laptop", adminUser);
            ticket2.setPriority(TicketPriority.LOW);
            ticket2.setCategory(TicketCategory.REQUEST);
            ticketService.createTicket(ticket2);
            
            Ticket ticket3 = new Ticket("Backup System Problem", "Daily backup job failed for 3 consecutive days", adminUser);
            ticket3.setPriority(TicketPriority.CRITICAL);
            ticket3.setCategory(TicketCategory.SECURITY);
            ticketService.createTicket(ticket3);
            
            // Count total tickets after creation
            long newTicketCount = ticketService.countAllTickets();
            return ResponseEntity.ok("3 additional sample tickets created successfully. Total tickets: " + newTicketCount);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }
    }
} 