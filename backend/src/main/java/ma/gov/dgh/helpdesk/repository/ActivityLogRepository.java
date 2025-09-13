package ma.gov.dgh.helpdesk.repository;

import ma.gov.dgh.helpdesk.entity.ActivityLog;
import ma.gov.dgh.helpdesk.entity.LogSeverity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for ActivityLog entity
 * Provides methods for querying and managing activity logs
 */
@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    
    /**
     * Find activity logs by user identifier
     */
    List<ActivityLog> findByUserIdentifierOrderByTimestampDesc(String userIdentifier);
    
    /**
     * Find activity logs by action type
     */
    List<ActivityLog> findByActionOrderByTimestampDesc(String action);
    
    /**
     * Find activity logs by severity level
     */
    List<ActivityLog> findBySeverityOrderByTimestampDesc(LogSeverity severity);
    
    /**
     * Find activity logs by user identifier and severity
     */
    List<ActivityLog> findByUserIdentifierAndSeverityOrderByTimestampDesc(String userIdentifier, LogSeverity severity);
    
    /**
     * Find activity logs within a time range
     */
    List<ActivityLog> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);
    
    /**
     * Find activity logs by IP address
     */
    List<ActivityLog> findByIpAddressOrderByTimestampDesc(String ipAddress);
    
    /**
     * Find activity logs by department
     */
    List<ActivityLog> findByDepartmentOrderByTimestampDesc(String department);
    
    /**
     * Find activity logs by affected resource
     */
    List<ActivityLog> findByAffectedResourceOrderByTimestampDesc(String affectedResource);
    
    /**
     * Search activity logs by details containing the search term
     */
    @Query("SELECT al FROM ActivityLog al WHERE al.details LIKE %:searchTerm% OR al.userIdentifier LIKE %:searchTerm% OR al.action LIKE %:searchTerm% ORDER BY al.timestamp DESC")
    List<ActivityLog> searchActivityLogs(@Param("searchTerm") String searchTerm);
    
    /**
     * Get paginated activity logs with filtering
     */
    @Query("SELECT al FROM ActivityLog al WHERE " +
           "(:userIdentifier IS NULL OR al.userIdentifier = :userIdentifier) AND " +
           "(:action IS NULL OR al.action = :action) AND " +
           "(:severity IS NULL OR al.severity = :severity) AND " +
           "(:startDate IS NULL OR al.timestamp >= :startDate) AND " +
           "(:endDate IS NULL OR al.timestamp <= :endDate) AND " +
           "(:searchTerm IS NULL OR al.details LIKE %:searchTerm% OR al.userIdentifier LIKE %:searchTerm%) " +
           "ORDER BY al.timestamp DESC")
    Page<ActivityLog> findActivityLogsWithFilters(
            @Param("userIdentifier") String userIdentifier,
            @Param("action") String action,
            @Param("severity") LogSeverity severity,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);
    
    /**
     * Count activity logs by severity for the last 24 hours
     */
    @Query("SELECT al.severity, COUNT(al) FROM ActivityLog al WHERE al.timestamp >= :startTime GROUP BY al.severity")
    List<Object[]> countBySeverityForLast24Hours(@Param("startTime") LocalDateTime startTime);
    
    /**
     * Get most active users in the last 24 hours
     */
    @Query("SELECT al.userIdentifier, COUNT(al) FROM ActivityLog al WHERE al.timestamp >= :startTime GROUP BY al.userIdentifier ORDER BY COUNT(al) DESC")
    List<Object[]> getMostActiveUsers(@Param("startTime") LocalDateTime startTime);
    
    /**
     * Get most common actions in the last 24 hours
     */
    @Query("SELECT al.action, COUNT(al) FROM ActivityLog al WHERE al.timestamp >= :startTime GROUP BY al.action ORDER BY COUNT(al) DESC")
    List<Object[]> getMostCommonActions(@Param("startTime") LocalDateTime startTime);
    
    /**
     * Find failed login attempts
     */
    @Query("SELECT al FROM ActivityLog al WHERE al.action = 'LOGIN_FAILED' AND al.timestamp >= :startTime ORDER BY al.timestamp DESC")
    List<ActivityLog> findFailedLoginAttempts(@Param("startTime") LocalDateTime startTime);
    
    /**
     * Find suspicious activities (multiple failed logins from same IP)
     */
    @Query("SELECT al.ipAddress, COUNT(al) FROM ActivityLog al WHERE al.action = 'LOGIN_FAILED' AND al.timestamp >= :startTime GROUP BY al.ipAddress HAVING COUNT(al) > 3")
    List<Object[]> findSuspiciousActivities(@Param("startTime") LocalDateTime startTime);
} 