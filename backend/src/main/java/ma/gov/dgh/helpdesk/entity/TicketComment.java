package ma.gov.dgh.helpdesk.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * TicketComment entity representing comments and updates on tickets
 */
@Entity
@Table(name = "ticket_comments", indexes = {
    @Index(name = "idx_comment_ticket", columnList = "ticket_id"),
    @Index(name = "idx_comment_user", columnList = "user_id"),
    @Index(name = "idx_comment_created_at", columnList = "created_at"),
    @Index(name = "idx_comment_internal", columnList = "is_internal")
})
public class TicketComment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    @JsonBackReference(value = "ticket-comments")
    private Ticket ticket;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference(value = "user-comments")
    private User user;
    
    @Lob
    @Column(name = "comment", nullable = false)
    @NotBlank(message = "Comment cannot be empty")
    private String comment;
    
    @Column(name = "is_internal")
    private Boolean isInternal = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "attachment_path", length = 500)
    private String attachmentPath;
    
    @Column(name = "attachment_name", length = 255)
    private String attachmentName;
    
    @Column(name = "attachment_size")
    private Long attachmentSize;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "comment_type", length = 50)
    private CommentType commentType = CommentType.COMMENT;
    
    // Constructors
    public TicketComment() {}
    
    public TicketComment(Ticket ticket, User user, String comment) {
        this.ticket = ticket;
        this.user = user;
        this.comment = comment;
    }
    
    public TicketComment(Ticket ticket, User user, String comment, Boolean isInternal) {
        this.ticket = ticket;
        this.user = user;
        this.comment = comment;
        this.isInternal = isInternal;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Ticket getTicket() {
        return ticket;
    }
    
    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getComment() {
        return comment;
    }
    
    public void setComment(String comment) {
        this.comment = comment;
    }
    
    public Boolean getIsInternal() {
        return isInternal;
    }
    
    public void setIsInternal(Boolean isInternal) {
        this.isInternal = isInternal;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getAttachmentPath() {
        return attachmentPath;
    }
    
    public void setAttachmentPath(String attachmentPath) {
        this.attachmentPath = attachmentPath;
    }
    
    public String getAttachmentName() {
        return attachmentName;
    }
    
    public void setAttachmentName(String attachmentName) {
        this.attachmentName = attachmentName;
    }
    
    public Long getAttachmentSize() {
        return attachmentSize;
    }
    
    public void setAttachmentSize(Long attachmentSize) {
        this.attachmentSize = attachmentSize;
    }
    
    public CommentType getCommentType() {
        return commentType;
    }
    
    public void setCommentType(CommentType commentType) {
        this.commentType = commentType;
    }
    
    // Utility methods
    public boolean hasAttachment() {
        return attachmentPath != null && !attachmentPath.trim().isEmpty();
    }
    
    @Override
    public String toString() {
        return "TicketComment{" +
                "id=" + id +
                ", ticketId=" + (ticket != null ? ticket.getId() : null) +
                ", userId=" + (user != null ? user.getId() : null) +
                ", isInternal=" + isInternal +
                ", commentType=" + commentType +
                ", createdAt=" + createdAt +
                '}';
    }
}
