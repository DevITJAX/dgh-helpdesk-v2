package ma.gov.dgh.helpdesk.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Ticket entity representing helpdesk tickets in the DGH HelpDesk system
 */
@Entity
@Table(name = "tickets", indexes = {
    @Index(name = "idx_ticket_status", columnList = "status"),
    @Index(name = "idx_ticket_priority", columnList = "priority"),
    @Index(name = "idx_ticket_category", columnList = "category"),
    @Index(name = "idx_ticket_created_by", columnList = "created_by"),
    @Index(name = "idx_ticket_assigned_to", columnList = "assigned_to"),
    @Index(name = "idx_ticket_equipment", columnList = "equipment_id"),
    @Index(name = "idx_ticket_created_at", columnList = "created_at")
})
public class Ticket {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "title", nullable = false, length = 255)
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    @Lob
    @Column(name = "description")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20)
    private TicketPriority priority = TicketPriority.MEDIUM;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private TicketStatus status = TicketStatus.OPEN;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 100)
    private TicketCategory category;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    @JsonBackReference(value = "user-created-tickets")
    private User createdBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    @JsonBackReference(value = "user-assigned-tickets")
    private User assignedTo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id")
    @JsonBackReference(value = "equipment-tickets")
    private Equipment equipment;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    @Column(name = "due_date")
    private LocalDateTime dueDate;
    
    @Lob
    @Column(name = "resolution")
    private String resolution;
    
    @Column(name = "estimated_hours")
    private Integer estimatedHours;
    
    @Column(name = "actual_hours")
    private Integer actualHours;
    
    @Column(name = "customer_satisfaction")
    private Integer customerSatisfaction; // 1-5 rating
    
    @Column(name = "is_escalated")
    private Boolean isEscalated = false;
    
    @Column(name = "escalation_reason", length = 500)
    @Size(max = 500, message = "Escalation reason must not exceed 500 characters")
    private String escalationReason;
    
    // Relationships
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    @JsonManagedReference(value = "ticket-comments")
    private List<TicketComment> comments = new ArrayList<>();
    
    // Constructors
    public Ticket() {}
    
    public Ticket(String title, String description, User createdBy) {
        this.title = title;
        this.description = description;
        this.createdBy = createdBy;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public TicketPriority getPriority() {
        return priority;
    }
    
    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }
    
    public TicketStatus getStatus() {
        return status;
    }
    
    public void setStatus(TicketStatus status) {
        this.status = status;
        if (status == TicketStatus.RESOLVED || status == TicketStatus.CLOSED) {
            this.resolvedAt = LocalDateTime.now();
        }
    }
    
    public TicketCategory getCategory() {
        return category;
    }
    
    public void setCategory(TicketCategory category) {
        this.category = category;
    }
    
    public User getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
    
    public User getAssignedTo() {
        return assignedTo;
    }
    
    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }
    
    public Equipment getEquipment() {
        return equipment;
    }
    
    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }
    
    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
    
    public LocalDateTime getDueDate() {
        return dueDate;
    }
    
    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }
    
    public String getResolution() {
        return resolution;
    }
    
    public void setResolution(String resolution) {
        this.resolution = resolution;
    }
    
    public Integer getEstimatedHours() {
        return estimatedHours;
    }
    
    public void setEstimatedHours(Integer estimatedHours) {
        this.estimatedHours = estimatedHours;
    }
    
    public Integer getActualHours() {
        return actualHours;
    }
    
    public void setActualHours(Integer actualHours) {
        this.actualHours = actualHours;
    }
    
    public Integer getCustomerSatisfaction() {
        return customerSatisfaction;
    }
    
    public void setCustomerSatisfaction(Integer customerSatisfaction) {
        this.customerSatisfaction = customerSatisfaction;
    }
    
    public Boolean getIsEscalated() {
        return isEscalated;
    }
    
    public void setIsEscalated(Boolean isEscalated) {
        this.isEscalated = isEscalated;
    }
    
    public String getEscalationReason() {
        return escalationReason;
    }
    
    public void setEscalationReason(String escalationReason) {
        this.escalationReason = escalationReason;
    }
    
    public List<TicketComment> getComments() {
        return comments;
    }
    
    public void setComments(List<TicketComment> comments) {
        this.comments = comments;
    }
    
    // Utility methods
    public boolean isOpen() {
        return status == TicketStatus.OPEN;
    }
    
    public boolean isInProgress() {
        return status == TicketStatus.IN_PROGRESS;
    }
    
    public boolean isResolved() {
        return status == TicketStatus.RESOLVED || status == TicketStatus.CLOSED;
    }
    
    public boolean isOverdue() {
        return dueDate != null && LocalDateTime.now().isAfter(dueDate) && !isResolved();
    }
    
    public void addComment(TicketComment comment) {
        comments.add(comment);
        comment.setTicket(this);
    }
    
    @Override
    public String toString() {
        return "Ticket{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", priority=" + priority +
                ", status=" + status +
                ", category=" + category +
                ", createdAt=" + createdAt +
                '}';
    }
}
