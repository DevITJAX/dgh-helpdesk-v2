package ma.gov.dgh.helpdesk.service;

import ma.gov.dgh.helpdesk.entity.ActivityLog;
import ma.gov.dgh.helpdesk.entity.LogSeverity;
import ma.gov.dgh.helpdesk.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service class for managing activity logs
 * Provides methods for logging activities and querying logs for admin monitoring
 */
@Service
public class ActivityLogService {
    
    @Autowired
    private ActivityLogRepository activityLogRepository;
    
    /**
     * Log an activity with current request information
     */
    public ActivityLog logActivity(String userIdentifier, String action, String details, LogSeverity severity) {
        ActivityLog activityLog = new ActivityLog(userIdentifier, action, details, severity);
        
        // Add request information if available
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                activityLog.setIpAddress(getClientIpAddress(request));
                activityLog.setUserAgent(request.getHeader("User-Agent"));
                activityLog.setSessionId(request.getSession().getId());
            }
        } catch (Exception e) {
            // Log without request information if not available
        }
        
        return activityLogRepository.save(activityLog);
    }
    
    /**
     * Log a successful login
     */
    public void logSuccessfulLogin(String userIdentifier) {
        logActivity(userIdentifier, "LOGIN", "User logged in successfully", LogSeverity.SUCCESS);
    }
    
    /**
     * Log a failed login attempt
     */
    public void logFailedLogin(String userIdentifier, String reason) {
        logActivity(userIdentifier, "LOGIN_FAILED", "Failed login attempt: " + reason, LogSeverity.ERROR);
    }
    
    /**
     * Log ticket creation
     */
    public void logTicketCreated(String userIdentifier, Long ticketId, String ticketTitle) {
        ActivityLog log = logActivity(userIdentifier, "TICKET_CREATED", 
                "Created ticket #" + ticketId + ": " + ticketTitle, LogSeverity.INFO);
        log.setAffectedResource("TICKET:" + ticketId);
        activityLogRepository.save(log);
    }
    
    /**
     * Log ticket status change
     */
    public void logTicketStatusChange(String userIdentifier, Long ticketId, String oldStatus, String newStatus) {
        ActivityLog log = logActivity(userIdentifier, "TICKET_STATUS_CHANGE", 
                "Changed ticket #" + ticketId + " status from " + oldStatus + " to " + newStatus, LogSeverity.INFO);
        log.setAffectedResource("TICKET:" + ticketId);
        log.setOldValue(oldStatus);
        log.setNewValue(newStatus);
        activityLogRepository.save(log);
    }
    
    /**
     * Log ticket assignment
     */
    public void logTicketAssigned(String userIdentifier, Long ticketId, String assignedTo) {
        ActivityLog log = logActivity(userIdentifier, "TICKET_ASSIGNED", 
                "Assigned ticket #" + ticketId + " to " + assignedTo, LogSeverity.INFO);
        log.setAffectedResource("TICKET:" + ticketId);
        log.setNewValue(assignedTo);
        activityLogRepository.save(log);
    }
    
    /**
     * Log ticket resolution
     */
    public void logTicketResolved(String userIdentifier, Long ticketId, String resolution) {
        ActivityLog log = logActivity(userIdentifier, "TICKET_RESOLVED", 
                "Resolved ticket #" + ticketId + ": " + resolution, LogSeverity.SUCCESS);
        log.setAffectedResource("TICKET:" + ticketId);
        log.setNewValue(resolution);
        activityLogRepository.save(log);
    }
    
    /**
     * Log user creation
     */
    public void logUserCreated(String userIdentifier, String newUserEmail, String role) {
        ActivityLog log = logActivity(userIdentifier, "USER_CREATED", 
                "Created new user: " + newUserEmail + " (" + role + ")", LogSeverity.SUCCESS);
        log.setAffectedResource("USER:" + newUserEmail);
        log.setNewValue(role);
        activityLogRepository.save(log);
    }
    
    /**
     * Log user update
     */
    public void logUserUpdated(String userIdentifier, String updatedUserEmail, String changes) {
        ActivityLog log = logActivity(userIdentifier, "USER_UPDATED", 
                "Updated user: " + updatedUserEmail + " - " + changes, LogSeverity.INFO);
        log.setAffectedResource("USER:" + updatedUserEmail);
        log.setNewValue(changes);
        activityLogRepository.save(log);
    }
    
    /**
     * Log system configuration change
     */
    public void logSystemConfigChange(String userIdentifier, String configName, String oldValue, String newValue) {
        ActivityLog log = logActivity(userIdentifier, "SYSTEM_CONFIG_CHANGE", 
                "Updated " + configName + " from " + oldValue + " to " + newValue, LogSeverity.WARNING);
        log.setAffectedResource("CONFIG:" + configName);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        activityLogRepository.save(log);
    }
    
    /**
     * Log equipment discovery
     */
    public void logEquipmentDiscovered(String userIdentifier, int deviceCount) {
        logActivity(userIdentifier, "EQUIPMENT_DISCOVERED", 
                "SNMP discovery found " + deviceCount + " new network devices", LogSeverity.INFO);
    }
    
    /**
     * Get paginated activity logs with filters
     */
    public Page<ActivityLog> getActivityLogs(String userIdentifier, String action, LogSeverity severity,
                                           LocalDateTime startDate, LocalDateTime endDate, String searchTerm, Pageable pageable) {
        return activityLogRepository.findActivityLogsWithFilters(userIdentifier, action, severity, startDate, endDate, searchTerm, pageable);
    }
    
    /**
     * Get recent activity logs (last 100 entries)
     */
    public List<ActivityLog> getRecentActivityLogs() {
        return activityLogRepository.findAll().stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .limit(100)
                .toList();
    }
    
    /**
     * Get activity logs by user
     */
    public List<ActivityLog> getActivityLogsByUser(String userIdentifier) {
        return activityLogRepository.findByUserIdentifierOrderByTimestampDesc(userIdentifier);
    }
    
    /**
     * Get activity logs by severity
     */
    public List<ActivityLog> getActivityLogsBySeverity(LogSeverity severity) {
        return activityLogRepository.findBySeverityOrderByTimestampDesc(severity);
    }
    
    /**
     * Get activity logs by action
     */
    public List<ActivityLog> getActivityLogsByAction(String action) {
        return activityLogRepository.findByActionOrderByTimestampDesc(action);
    }
    
    /**
     * Search activity logs
     */
    public List<ActivityLog> searchActivityLogs(String searchTerm) {
        return activityLogRepository.searchActivityLogs(searchTerm);
    }
    
    /**
     * Get activity statistics for the last 24 hours
     */
    public Map<LogSeverity, Long> getActivityStatistics() {
        LocalDateTime startTime = LocalDateTime.now().minusHours(24);
        List<Object[]> results = activityLogRepository.countBySeverityForLast24Hours(startTime);
        
        return results.stream()
                .collect(java.util.stream.Collectors.toMap(
                        result -> (LogSeverity) result[0],
                        result -> (Long) result[1]
                ));
    }
    
    /**
     * Get most active users in the last 24 hours
     */
    public List<Map<String, Object>> getMostActiveUsers() {
        LocalDateTime startTime = LocalDateTime.now().minusHours(24);
        List<Object[]> results = activityLogRepository.getMostActiveUsers(startTime);
        
        return results.stream()
                .map(result -> Map.of(
                        "userIdentifier", result[0],
                        "activityCount", result[1]
                ))
                .toList();
    }
    
    /**
     * Get most common actions in the last 24 hours
     */
    public List<Map<String, Object>> getMostCommonActions() {
        LocalDateTime startTime = LocalDateTime.now().minusHours(24);
        List<Object[]> results = activityLogRepository.getMostCommonActions(startTime);
        
        return results.stream()
                .map(result -> Map.of(
                        "action", result[0],
                        "count", result[1]
                ))
                .toList();
    }
    
    /**
     * Get failed login attempts in the last 24 hours
     */
    public List<ActivityLog> getFailedLoginAttempts() {
        LocalDateTime startTime = LocalDateTime.now().minusHours(24);
        return activityLogRepository.findFailedLoginAttempts(startTime);
    }
    
    /**
     * Get suspicious activities (multiple failed logins from same IP)
     */
    public List<Map<String, Object>> getSuspiciousActivities() {
        LocalDateTime startTime = LocalDateTime.now().minusHours(24);
        List<Object[]> results = activityLogRepository.findSuspiciousActivities(startTime);
        
        return results.stream()
                .map(result -> Map.of(
                        "ipAddress", result[0],
                        "failedAttempts", result[1]
                ))
                .toList();
    }
    
    /**
     * Get activity log by ID
     */
    public Optional<ActivityLog> getActivityLogById(Long id) {
        return activityLogRepository.findById(id);
    }
    
    /**
     * Delete old activity logs (older than specified days)
     */
    public void deleteOldActivityLogs(int daysToKeep) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
        List<ActivityLog> oldLogs = activityLogRepository.findByTimestampBetweenOrderByTimestampDesc(
                LocalDateTime.MIN, cutoffDate);
        activityLogRepository.deleteAll(oldLogs);
    }
    
    /**
     * Get client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
} 