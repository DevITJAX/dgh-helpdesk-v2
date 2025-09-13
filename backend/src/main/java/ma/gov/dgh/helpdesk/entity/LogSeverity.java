package ma.gov.dgh.helpdesk.entity;

/**
 * LogSeverity enum for categorizing activity log entries
 * Used for filtering and prioritizing log entries
 */
public enum LogSeverity {
    ERROR("Error", "Critical errors that require immediate attention"),
    WARNING("Warning", "Potential issues that should be monitored"),
    SUCCESS("Success", "Successful operations and positive outcomes"),
    INFO("Info", "General information and routine activities");
    
    private final String displayName;
    private final String description;
    
    LogSeverity(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
} 