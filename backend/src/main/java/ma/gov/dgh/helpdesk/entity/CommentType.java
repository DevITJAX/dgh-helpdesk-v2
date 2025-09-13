package ma.gov.dgh.helpdesk.entity;

/**
 * Enumeration for comment types in the DGH HelpDesk system
 */
public enum CommentType {
    /**
     * Regular comment or note
     */
    COMMENT("Comment"),
    
    /**
     * Status change notification
     */
    STATUS_CHANGE("Status Change"),
    
    /**
     * Assignment change notification
     */
    ASSIGNMENT_CHANGE("Assignment Change"),
    
    /**
     * Priority change notification
     */
    PRIORITY_CHANGE("Priority Change"),
    
    /**
     * System-generated notification
     */
    SYSTEM("System Notification"),
    
    /**
     * Resolution or solution provided
     */
    RESOLUTION("Resolution");
    
    private final String displayName;
    
    CommentType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}
