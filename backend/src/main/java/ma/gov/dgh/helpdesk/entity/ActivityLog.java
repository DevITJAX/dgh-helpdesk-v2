package ma.gov.dgh.helpdesk.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * ActivityLog entity for tracking all system activities
 * Used for admin monitoring, security auditing, and compliance
 */
@Entity
@Table(name = "activity_logs")
public class ActivityLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @NotBlank
    @Column(name = "user_identifier", nullable = false)
    private String userIdentifier; // Username or email
    
    @NotBlank
    @Column(name = "action", nullable = false)
    private String action; // LOGIN, TICKET_CREATED, USER_CREATED, etc.
    
    @Column(name = "details", columnDefinition = "TEXT")
    private String details; // Detailed description of the action
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private LogSeverity severity; // ERROR, WARNING, SUCCESS, INFO
    
    @Column(name = "ip_address")
    private String ipAddress; // IP address of the user
    
    @Column(name = "user_agent")
    private String userAgent; // Browser/client information
    
    @Column(name = "session_id")
    private String sessionId; // Session identifier
    
    @Column(name = "affected_resource")
    private String affectedResource; // Resource that was affected (ticket ID, user ID, etc.)
    
    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue; // Previous value (for updates)
    
    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue; // New value (for updates)
    
    @Column(name = "department")
    private String department; // User's department
    
    @Column(name = "location")
    private String location; // User's location/office
    
    // Constructors
    public ActivityLog() {}
    
    public ActivityLog(String userIdentifier, String action, String details, LogSeverity severity) {
        this.timestamp = LocalDateTime.now();
        this.userIdentifier = userIdentifier;
        this.action = action;
        this.details = details;
        this.severity = severity;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getUserIdentifier() {
        return userIdentifier;
    }
    
    public void setUserIdentifier(String userIdentifier) {
        this.userIdentifier = userIdentifier;
    }
    
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public String getDetails() {
        return details;
    }
    
    public void setDetails(String details) {
        this.details = details;
    }
    
    public LogSeverity getSeverity() {
        return severity;
    }
    
    public void setSeverity(LogSeverity severity) {
        this.severity = severity;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public String getAffectedResource() {
        return affectedResource;
    }
    
    public void setAffectedResource(String affectedResource) {
        this.affectedResource = affectedResource;
    }
    
    public String getOldValue() {
        return oldValue;
    }
    
    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }
    
    public String getNewValue() {
        return newValue;
    }
    
    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }
    
    public String getDepartment() {
        return department;
    }
    
    public void setDepartment(String department) {
        this.department = department;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    @Override
    public String toString() {
        return "ActivityLog{" +
                "id=" + id +
                ", timestamp=" + timestamp +
                ", userIdentifier='" + userIdentifier + '\'' +
                ", action='" + action + '\'' +
                ", details='" + details + '\'' +
                ", severity=" + severity +
                ", ipAddress='" + ipAddress + '\'' +
                '}';
    }
} 