package ma.gov.dgh.helpdesk.service;

import ma.gov.dgh.helpdesk.entity.*;
import ma.gov.dgh.helpdesk.repository.TicketRepository;
import ma.gov.dgh.helpdesk.repository.TicketCommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Ticket entity operations
 */
@Service
@Transactional
public class TicketService {
    
    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    
    @Autowired
    public TicketService(TicketRepository ticketRepository, TicketCommentRepository ticketCommentRepository) {
        this.ticketRepository = ticketRepository;
        this.ticketCommentRepository = ticketCommentRepository;
    }
    
    /**
     * Create a new ticket
     */
    public Ticket createTicket(Ticket ticket) {
        if (ticket.getCreatedBy() == null) {
            throw new IllegalArgumentException("Ticket must have a creator");
        }
        
        // Set default values
        if (ticket.getPriority() == null) {
            ticket.setPriority(TicketPriority.MEDIUM);
        }
        if (ticket.getStatus() == null) {
            ticket.setStatus(TicketStatus.OPEN);
        }
        
        // Set due date based on priority if not set
        if (ticket.getDueDate() == null) {
            ticket.setDueDate(calculateDueDate(ticket.getPriority()));
        }
        
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Add initial system comment
        TicketComment initialComment = new TicketComment(savedTicket, ticket.getCreatedBy(), 
            "Ticket created", true);
        initialComment.setCommentType(CommentType.SYSTEM);
        ticketCommentRepository.save(initialComment);
        
        return savedTicket;
    }
    
    /**
     * Update an existing ticket
     */
    public Ticket updateTicket(Ticket ticket) {
        if (ticket.getId() == null) {
            throw new IllegalArgumentException("Ticket ID cannot be null for update operation");
        }
        
        Optional<Ticket> existingTicket = ticketRepository.findById(ticket.getId());
        if (existingTicket.isEmpty()) {
            throw new IllegalArgumentException("Ticket not found with ID: " + ticket.getId());
        }
        
        Ticket oldTicket = existingTicket.get();
        
        // Track changes for audit trail
        if (!oldTicket.getStatus().equals(ticket.getStatus())) {
            addStatusChangeComment(ticket, oldTicket.getStatus(), ticket.getStatus());
        }
        
        if (!oldTicket.getPriority().equals(ticket.getPriority())) {
            addPriorityChangeComment(ticket, oldTicket.getPriority(), ticket.getPriority());
        }
        
        if ((oldTicket.getAssignedTo() == null && ticket.getAssignedTo() != null) ||
            (oldTicket.getAssignedTo() != null && !oldTicket.getAssignedTo().equals(ticket.getAssignedTo()))) {
            addAssignmentChangeComment(ticket, oldTicket.getAssignedTo(), ticket.getAssignedTo());
        }
        
        return ticketRepository.save(ticket);
    }
    
    /**
     * Find ticket by ID
     */
    @Transactional(readOnly = true)
    public Optional<Ticket> findById(Long id) {
        return ticketRepository.findById(id);
    }
    
    /**
     * Get all tickets
     */
    @Transactional(readOnly = true)
    public List<Ticket> findAll() {
        return ticketRepository.findAll();
    }
    
    /**
     * Count all tickets
     */
    @Transactional(readOnly = true)
    public long countAllTickets() {
        return ticketRepository.count();
    }
    
    /**
     * Get tickets by status
     */
    @Transactional(readOnly = true)
    public List<Ticket> findByStatus(TicketStatus status) {
        return ticketRepository.findByStatus(status);
    }
    
    /**
     * Get tickets by priority
     */
    @Transactional(readOnly = true)
    public List<Ticket> findByPriority(TicketPriority priority) {
        return ticketRepository.findByPriority(priority);
    }
    
    /**
     * Get tickets by category
     */
    @Transactional(readOnly = true)
    public List<Ticket> findByCategory(TicketCategory category) {
        return ticketRepository.findByCategory(category);
    }
    
    /**
     * Get tickets created by user
     */
    @Transactional(readOnly = true)
    public List<Ticket> findByCreatedBy(User createdBy) {
        return ticketRepository.findByCreatedBy(createdBy);
    }
    
    /**
     * Get tickets assigned to user
     */
    @Transactional(readOnly = true)
    public List<Ticket> findByAssignedTo(User assignedTo) {
        return ticketRepository.findByAssignedTo(assignedTo);
    }
    
    /**
     * Get unassigned tickets
     */
    @Transactional(readOnly = true)
    public List<Ticket> findUnassignedTickets() {
        return ticketRepository.findByAssignedToIsNull();
    }
    
    /**
     * Get open tickets
     */
    @Transactional(readOnly = true)
    public List<Ticket> findOpenTickets() {
        return ticketRepository.findOpenTickets();
    }
    
    /**
     * Get overdue tickets
     */
    @Transactional(readOnly = true)
    public List<Ticket> findOverdueTickets() {
        return ticketRepository.findOverdueTickets(LocalDateTime.now());
    }
    
    /**
     * Get escalated tickets
     */
    @Transactional(readOnly = true)
    public List<Ticket> findEscalatedTickets() {
        return ticketRepository.findByIsEscalatedTrue();
    }
    
    /**
     * Get critical open tickets
     */
    @Transactional(readOnly = true)
    public List<Ticket> findCriticalOpenTickets() {
        return ticketRepository.findCriticalOpenTickets();
    }
    
    /**
     * Get tickets with filters and pagination
     */
    @Transactional(readOnly = true)
    public Page<Ticket> findTicketsWithFilters(String search, TicketStatus status, TicketPriority priority,
                                              TicketCategory category, User createdBy, User assignedTo,
                                              Long equipmentId, Pageable pageable) {
        return ticketRepository.findTicketsWithFilters(search, status, priority, category, 
                                                      createdBy, assignedTo, equipmentId, pageable);
    }
    
    /**
     * Assign ticket to user
     */
    public Ticket assignTicket(Long ticketId, User assignedTo) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new IllegalArgumentException("Ticket not found with ID: " + ticketId);
        }
        
        Ticket ticket = ticketOpt.get();
        User previousAssignee = ticket.getAssignedTo();
        ticket.setAssignedTo(assignedTo);
        
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Add assignment change comment
        addAssignmentChangeComment(savedTicket, previousAssignee, assignedTo);
        
        return savedTicket;
    }
    
    /**
     * Change ticket status
     */
    public Ticket changeStatus(Long ticketId, TicketStatus newStatus, String comment) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new IllegalArgumentException("Ticket not found with ID: " + ticketId);
        }
        
        Ticket ticket = ticketOpt.get();
        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(newStatus);
        
        if (newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Add status change comment
        addStatusChangeComment(savedTicket, oldStatus, newStatus);
        
        // Add user comment if provided
        if (comment != null && !comment.trim().isEmpty()) {
            TicketComment userComment = new TicketComment(savedTicket, ticket.getAssignedTo(), comment);
            userComment.setCommentType(CommentType.COMMENT);
            ticketCommentRepository.save(userComment);
        }
        
        return savedTicket;
    }
    
    /**
     * Escalate ticket
     */
    public Ticket escalateTicket(Long ticketId, String reason) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new IllegalArgumentException("Ticket not found with ID: " + ticketId);
        }
        
        Ticket ticket = ticketOpt.get();
        ticket.setIsEscalated(true);
        ticket.setEscalationReason(reason);
        
        // Increase priority if not already critical
        if (ticket.getPriority() != TicketPriority.CRITICAL) {
            TicketPriority oldPriority = ticket.getPriority();
            ticket.setPriority(TicketPriority.HIGH);
            addPriorityChangeComment(ticket, oldPriority, TicketPriority.HIGH);
        }
        
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Add escalation comment
        TicketComment escalationComment = new TicketComment(savedTicket, ticket.getCreatedBy(), 
            "Ticket escalated. Reason: " + reason, true);
        escalationComment.setCommentType(CommentType.SYSTEM);
        ticketCommentRepository.save(escalationComment);
        
        return savedTicket;
    }
    
    /**
     * Add comment to ticket
     */
    public TicketComment addComment(Long ticketId, User user, String comment, Boolean isInternal) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new IllegalArgumentException("Ticket not found with ID: " + ticketId);
        }
        
        Ticket ticket = ticketOpt.get();
        TicketComment ticketComment = new TicketComment(ticket, user, comment, isInternal);
        return ticketCommentRepository.save(ticketComment);
    }
    
    /**
     * Get ticket comments
     */
    @Transactional(readOnly = true)
    public List<TicketComment> getTicketComments(Long ticketId) {
        return ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }
    
    /**
     * Delete ticket
     */
    public void deleteTicket(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new IllegalArgumentException("Ticket not found with ID: " + ticketId);
        }
        ticketRepository.deleteById(ticketId);
    }
    
    /**
     * Get ticket statistics
     */
    @Transactional(readOnly = true)
    public TicketStatistics getTicketStatistics() {
        long totalTickets = ticketRepository.count();
        long openTickets = ticketRepository.countByStatus(TicketStatus.OPEN);
        long inProgressTickets = ticketRepository.countByStatus(TicketStatus.IN_PROGRESS);
        long resolvedTickets = ticketRepository.countByStatus(TicketStatus.RESOLVED);
        long closedTickets = ticketRepository.countByStatus(TicketStatus.CLOSED);
        long unassignedTickets = ticketRepository.countByAssignedToIsNull();
        long escalatedTickets = ticketRepository.countByIsEscalatedTrue();
        
        return new TicketStatistics(totalTickets, openTickets, inProgressTickets, 
                                   resolvedTickets, closedTickets, unassignedTickets, escalatedTickets);
    }
    
    /**
     * Get tickets created today
     */
    @Transactional(readOnly = true)
    public List<Ticket> findTicketsCreatedToday() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return ticketRepository.findTicketsCreatedToday(startOfDay, endOfDay);
    }
    
    /**
     * Get tickets resolved today
     */
    @Transactional(readOnly = true)
    public List<Ticket> findTicketsResolvedToday() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return ticketRepository.findTicketsResolvedToday(startOfDay, endOfDay);
    }
    
    // Private helper methods
    
    private LocalDateTime calculateDueDate(TicketPriority priority) {
        LocalDateTime now = LocalDateTime.now();
        return switch (priority) {
            case CRITICAL -> now.plusHours(4);
            case HIGH -> now.plusDays(1);
            case MEDIUM -> now.plusDays(3);
            case LOW -> now.plusDays(7);
        };
    }
    
    private void addStatusChangeComment(Ticket ticket, TicketStatus oldStatus, TicketStatus newStatus) {
        String comment = String.format("Status changed from %s to %s", oldStatus.getDisplayName(), newStatus.getDisplayName());
        TicketComment statusComment = new TicketComment(ticket, ticket.getAssignedTo(), comment, true);
        statusComment.setCommentType(CommentType.STATUS_CHANGE);
        ticketCommentRepository.save(statusComment);
    }
    
    private void addPriorityChangeComment(Ticket ticket, TicketPriority oldPriority, TicketPriority newPriority) {
        String comment = String.format("Priority changed from %s to %s", oldPriority.getDisplayName(), newPriority.getDisplayName());
        TicketComment priorityComment = new TicketComment(ticket, ticket.getAssignedTo(), comment, true);
        priorityComment.setCommentType(CommentType.PRIORITY_CHANGE);
        ticketCommentRepository.save(priorityComment);
    }
    
    private void addAssignmentChangeComment(Ticket ticket, User oldAssignee, User newAssignee) {
        String comment;
        if (oldAssignee == null) {
            comment = String.format("Ticket assigned to %s", newAssignee.getFullName());
        } else {
            comment = String.format("Ticket reassigned from %s to %s", oldAssignee.getFullName(), newAssignee.getFullName());
        }
        TicketComment assignmentComment = new TicketComment(ticket, newAssignee, comment, true);
        assignmentComment.setCommentType(CommentType.ASSIGNMENT_CHANGE);
        ticketCommentRepository.save(assignmentComment);
    }
    
    /**
     * Inner class for ticket statistics
     */
    public static class TicketStatistics {
        private final long totalTickets;
        private final long openTickets;
        private final long inProgressTickets;
        private final long resolvedTickets;
        private final long closedTickets;
        private final long unassignedTickets;
        private final long escalatedTickets;
        
        public TicketStatistics(long totalTickets, long openTickets, long inProgressTickets,
                               long resolvedTickets, long closedTickets, long unassignedTickets,
                               long escalatedTickets) {
            this.totalTickets = totalTickets;
            this.openTickets = openTickets;
            this.inProgressTickets = inProgressTickets;
            this.resolvedTickets = resolvedTickets;
            this.closedTickets = closedTickets;
            this.unassignedTickets = unassignedTickets;
            this.escalatedTickets = escalatedTickets;
        }
        
        // Getters
        public long getTotalTickets() { return totalTickets; }
        public long getOpenTickets() { return openTickets; }
        public long getInProgressTickets() { return inProgressTickets; }
        public long getResolvedTickets() { return resolvedTickets; }
        public long getClosedTickets() { return closedTickets; }
        public long getUnassignedTickets() { return unassignedTickets; }
        public long getEscalatedTickets() { return escalatedTickets; }
    }
}
