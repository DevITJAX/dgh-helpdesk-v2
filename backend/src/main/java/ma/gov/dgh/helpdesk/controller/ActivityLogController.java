package ma.gov.dgh.helpdesk.controller;

import ma.gov.dgh.helpdesk.entity.ActivityLog;
import ma.gov.dgh.helpdesk.entity.LogSeverity;
import ma.gov.dgh.helpdesk.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Activity Log management
 * Provides endpoints for admin access to system activity logs
 */
@RestController
@RequestMapping("/api/activity-logs")
@CrossOrigin(origins = "*")
public class ActivityLogController {
    
    @Autowired
    private ActivityLogService activityLogService;
    
    /**
     * Get paginated activity logs with filters (Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ActivityLog>> getActivityLogs(
            @RequestParam(required = false) String userIdentifier,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) LogSeverity severity,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityLog> logs = activityLogService.getActivityLogs(
                userIdentifier, action, severity, startDate, endDate, searchTerm, pageable);
        
        return ResponseEntity.ok(logs);
    }
    
    /**
     * Get recent activity logs (Admin only)
     */
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ActivityLog>> getRecentActivityLogs() {
        List<ActivityLog> logs = activityLogService.getRecentActivityLogs();
        return ResponseEntity.ok(logs);
    }
    
    /**
     * Get activity logs by user (Admin only)
     */
    @GetMapping("/user/{userIdentifier}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ActivityLog>> getActivityLogsByUser(@PathVariable String userIdentifier) {
        List<ActivityLog> logs = activityLogService.getActivityLogsByUser(userIdentifier);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * Get activity logs by severity (Admin only)
     */
    @GetMapping("/severity/{severity}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ActivityLog>> getActivityLogsBySeverity(@PathVariable LogSeverity severity) {
        List<ActivityLog> logs = activityLogService.getActivityLogsBySeverity(severity);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * Get activity logs by action (Admin only)
     */
    @GetMapping("/action/{action}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ActivityLog>> getActivityLogsByAction(@PathVariable String action) {
        List<ActivityLog> logs = activityLogService.getActivityLogsByAction(action);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * Search activity logs (Admin only)
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ActivityLog>> searchActivityLogs(@RequestParam String searchTerm) {
        List<ActivityLog> logs = activityLogService.searchActivityLogs(searchTerm);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * Get activity statistics for the last 24 hours (Admin only)
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<LogSeverity, Long>> getActivityStatistics() {
        Map<LogSeverity, Long> statistics = activityLogService.getActivityStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Get most active users in the last 24 hours (Admin only)
     */
    @GetMapping("/most-active-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getMostActiveUsers() {
        List<Map<String, Object>> activeUsers = activityLogService.getMostActiveUsers();
        return ResponseEntity.ok(activeUsers);
    }
    
    /**
     * Get most common actions in the last 24 hours (Admin only)
     */
    @GetMapping("/most-common-actions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getMostCommonActions() {
        List<Map<String, Object>> commonActions = activityLogService.getMostCommonActions();
        return ResponseEntity.ok(commonActions);
    }
    
    /**
     * Get failed login attempts in the last 24 hours (Admin only)
     */
    @GetMapping("/failed-logins")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ActivityLog>> getFailedLoginAttempts() {
        List<ActivityLog> failedLogins = activityLogService.getFailedLoginAttempts();
        return ResponseEntity.ok(failedLogins);
    }
    
    /**
     * Get suspicious activities (Admin only)
     */
    @GetMapping("/suspicious-activities")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getSuspiciousActivities() {
        List<Map<String, Object>> suspiciousActivities = activityLogService.getSuspiciousActivities();
        return ResponseEntity.ok(suspiciousActivities);
    }
    
    /**
     * Get activity log by ID (Admin only)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ActivityLog> getActivityLogById(@PathVariable Long id) {
        return activityLogService.getActivityLogById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Delete old activity logs (Admin only)
     */
    @DeleteMapping("/cleanup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteOldActivityLogs(@RequestParam(defaultValue = "90") int daysToKeep) {
        activityLogService.deleteOldActivityLogs(daysToKeep);
        return ResponseEntity.ok("Old activity logs deleted successfully");
    }
    
    /**
     * Export activity logs (Admin only)
     */
    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ActivityLog>> exportActivityLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String userIdentifier,
            @RequestParam(required = false) LogSeverity severity) {
        
        // For export, we'll get all logs without pagination
        Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
        Page<ActivityLog> logs = activityLogService.getActivityLogs(
                userIdentifier, null, severity, startDate, endDate, null, pageable);
        
        return ResponseEntity.ok(logs.getContent());
    }
} 