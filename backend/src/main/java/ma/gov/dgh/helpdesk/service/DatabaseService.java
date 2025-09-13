package ma.gov.dgh.helpdesk.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Service for database operations and validation
 */
@Service
public class DatabaseService {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseService.class);
    
    private final JdbcTemplate jdbcTemplate;
    
    @Autowired
    public DatabaseService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    /**
     * Validate database schema on application startup
     */
    @EventListener(ApplicationReadyEvent.class)
    public void validateDatabaseOnStartup() {
        logger.info("Starting database schema validation...");
        
        try {
            DatabaseValidationResult result = validateDatabaseSchema();
            
            if (result.isValid()) {
                logger.info("Database schema validation completed successfully");
                logger.info("Validation summary: {}", result.getSummary());
            } else {
                logger.warn("Database schema validation found issues: {}", result.getIssues());
            }
            
        } catch (Exception e) {
            logger.error("Database schema validation failed: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Validate database schema
     */
    public DatabaseValidationResult validateDatabaseSchema() {
        DatabaseValidationResult result = new DatabaseValidationResult();
        
        try {
            // Load and execute validation script
            String validationScript = loadResourceAsString("schema-validation.sql");
            String[] queries = validationScript.split(";");
            
            for (String query : queries) {
                query = query.trim();
                if (!query.isEmpty() && !query.startsWith("--")) {
                    try {
                        List<Map<String, Object>> queryResult = jdbcTemplate.queryForList(query);
                        result.addValidationResult(query, queryResult);
                    } catch (Exception e) {
                        result.addError("Query failed: " + query.substring(0, Math.min(50, query.length())) + "...", e.getMessage());
                    }
                }
            }
            
        } catch (Exception e) {
            result.addError("Schema validation failed", e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Get database statistics
     */
    public DatabaseStatistics getDatabaseStatistics() {
        DatabaseStatistics stats = new DatabaseStatistics();
        
        try {
            // Get table row counts
            stats.setUserCount(getTableRowCount("USERS"));
            stats.setEquipmentCount(getTableRowCount("EQUIPMENT"));
            stats.setTicketCount(getTableRowCount("TICKETS"));
            stats.setCommentCount(getTableRowCount("TICKET_COMMENTS"));
            
            // Get active counts
            stats.setActiveUserCount(jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM USERS WHERE IS_ACTIVE = true", Long.class));
            
            stats.setOnlineEquipmentCount(jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM EQUIPMENT WHERE STATUS = 'ONLINE'", Long.class));
            
            stats.setOpenTicketCount(jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM TICKETS WHERE STATUS IN ('OPEN', 'IN_PROGRESS')", Long.class));
            
            // Get database size (H2 specific)
            try {
                List<Map<String, Object>> sizeResult = jdbcTemplate.queryForList(
                    "SELECT SUM(STORAGE_SIZE) as total_size FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'PUBLIC'");
                if (!sizeResult.isEmpty() && sizeResult.get(0).get("total_size") != null) {
                    stats.setDatabaseSizeBytes((Long) sizeResult.get(0).get("total_size"));
                }
            } catch (Exception e) {
                logger.debug("Could not get database size: {}", e.getMessage());
            }
            
        } catch (Exception e) {
            logger.error("Error getting database statistics: {}", e.getMessage());
        }
        
        return stats;
    }
    
    /**
     * Clean up old data (for maintenance)
     */
    public CleanupResult cleanupOldData(int daysToKeep) {
        CleanupResult result = new CleanupResult();
        
        try {
            // Clean up old resolved tickets (older than specified days)
            String cleanupTicketsQuery = 
                "DELETE FROM TICKET_COMMENTS WHERE TICKET_ID IN " +
                "(SELECT ID FROM TICKETS WHERE STATUS IN ('CLOSED', 'CANCELLED') AND RESOLVED_AT < DATEADD('DAY', ?, CURRENT_TIMESTAMP))";
            
            int commentsDeleted = jdbcTemplate.update(cleanupTicketsQuery, -daysToKeep);
            result.setCommentsDeleted(commentsDeleted);
            
            String cleanupTicketsMainQuery = 
                "DELETE FROM TICKETS WHERE STATUS IN ('CLOSED', 'CANCELLED') AND RESOLVED_AT < DATEADD('DAY', ?, CURRENT_TIMESTAMP)";
            
            int ticketsDeleted = jdbcTemplate.update(cleanupTicketsMainQuery, -daysToKeep);
            result.setTicketsDeleted(ticketsDeleted);
            
            // Clean up old equipment that hasn't been seen for a long time
            String cleanupEquipmentQuery = 
                "DELETE FROM EQUIPMENT WHERE STATUS = 'OFFLINE' AND LAST_SEEN < DATEADD('DAY', ?, CURRENT_TIMESTAMP) AND IS_MANAGED = false";
            
            int equipmentDeleted = jdbcTemplate.update(cleanupEquipmentQuery, -daysToKeep * 2); // Keep equipment longer
            result.setEquipmentDeleted(equipmentDeleted);
            
            result.setSuccess(true);
            result.setMessage("Cleanup completed successfully");
            
            logger.info("Database cleanup completed: {} tickets, {} comments, {} equipment deleted", 
                       ticketsDeleted, commentsDeleted, equipmentDeleted);
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("Cleanup failed: " + e.getMessage());
            logger.error("Database cleanup failed: {}", e.getMessage(), e);
        }
        
        return result;
    }
    
    /**
     * Backup database (H2 specific)
     */
    public BackupResult backupDatabase(String backupPath) {
        BackupResult result = new BackupResult();
        
        try {
            String backupQuery = "BACKUP TO '" + backupPath + "'";
            jdbcTemplate.execute(backupQuery);
            
            result.setSuccess(true);
            result.setMessage("Database backup completed successfully");
            result.setBackupPath(backupPath);
            
            logger.info("Database backup completed: {}", backupPath);
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("Backup failed: " + e.getMessage());
            logger.error("Database backup failed: {}", e.getMessage(), e);
        }
        
        return result;
    }
    
    // Helper methods
    
    private long getTableRowCount(String tableName) {
        try {
            return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tableName, Long.class);
        } catch (Exception e) {
            logger.warn("Could not get row count for table {}: {}", tableName, e.getMessage());
            return 0;
        }
    }
    
    private String loadResourceAsString(String resourcePath) throws IOException {
        ClassPathResource resource = new ClassPathResource(resourcePath);
        try (InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)) {
            return FileCopyUtils.copyToString(reader);
        }
    }
    
    // Inner classes for results
    
    public static class DatabaseValidationResult {
        private boolean valid = true;
        private StringBuilder summary = new StringBuilder();
        private StringBuilder issues = new StringBuilder();
        
        public void addValidationResult(String query, List<Map<String, Object>> result) {
            if (!result.isEmpty()) {
                Map<String, Object> row = result.get(0);
                for (Map.Entry<String, Object> entry : row.entrySet()) {
                    String value = entry.getValue().toString();
                    summary.append(value).append("\n");
                    
                    if (value.startsWith("FAIL:") || value.startsWith("ERROR:")) {
                        valid = false;
                        issues.append(value).append("\n");
                    }
                }
            }
        }
        
        public void addError(String context, String error) {
            valid = false;
            issues.append(context).append(": ").append(error).append("\n");
        }
        
        public boolean isValid() { return valid; }
        public String getSummary() { return summary.toString(); }
        public String getIssues() { return issues.toString(); }
    }
    
    public static class DatabaseStatistics {
        private long userCount;
        private long equipmentCount;
        private long ticketCount;
        private long commentCount;
        private long activeUserCount;
        private long onlineEquipmentCount;
        private long openTicketCount;
        private long databaseSizeBytes;
        
        // Getters and setters
        public long getUserCount() { return userCount; }
        public void setUserCount(long userCount) { this.userCount = userCount; }
        
        public long getEquipmentCount() { return equipmentCount; }
        public void setEquipmentCount(long equipmentCount) { this.equipmentCount = equipmentCount; }
        
        public long getTicketCount() { return ticketCount; }
        public void setTicketCount(long ticketCount) { this.ticketCount = ticketCount; }
        
        public long getCommentCount() { return commentCount; }
        public void setCommentCount(long commentCount) { this.commentCount = commentCount; }
        
        public long getActiveUserCount() { return activeUserCount; }
        public void setActiveUserCount(long activeUserCount) { this.activeUserCount = activeUserCount; }
        
        public long getOnlineEquipmentCount() { return onlineEquipmentCount; }
        public void setOnlineEquipmentCount(long onlineEquipmentCount) { this.onlineEquipmentCount = onlineEquipmentCount; }
        
        public long getOpenTicketCount() { return openTicketCount; }
        public void setOpenTicketCount(long openTicketCount) { this.openTicketCount = openTicketCount; }
        
        public long getDatabaseSizeBytes() { return databaseSizeBytes; }
        public void setDatabaseSizeBytes(long databaseSizeBytes) { this.databaseSizeBytes = databaseSizeBytes; }
    }
    
    public static class CleanupResult {
        private boolean success;
        private String message;
        private int ticketsDeleted;
        private int commentsDeleted;
        private int equipmentDeleted;
        
        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public int getTicketsDeleted() { return ticketsDeleted; }
        public void setTicketsDeleted(int ticketsDeleted) { this.ticketsDeleted = ticketsDeleted; }
        
        public int getCommentsDeleted() { return commentsDeleted; }
        public void setCommentsDeleted(int commentsDeleted) { this.commentsDeleted = commentsDeleted; }
        
        public int getEquipmentDeleted() { return equipmentDeleted; }
        public void setEquipmentDeleted(int equipmentDeleted) { this.equipmentDeleted = equipmentDeleted; }
    }
    
    public static class BackupResult {
        private boolean success;
        private String message;
        private String backupPath;
        
        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public String getBackupPath() { return backupPath; }
        public void setBackupPath(String backupPath) { this.backupPath = backupPath; }
    }
}
