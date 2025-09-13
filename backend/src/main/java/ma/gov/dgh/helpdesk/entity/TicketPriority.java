package ma.gov.dgh.helpdesk.entity;

/**
 * Enumeration for ticket priorities in the DGH HelpDesk system
 */
public enum TicketPriority {
    /**
     * Low priority - non-urgent issues
     */
    LOW("Low", 1),
    
    /**
     * Medium priority - standard issues
     */
    MEDIUM("Medium", 2),
    
    /**
     * High priority - important issues
     */
    HIGH("High", 3),
    
    /**
     * Critical priority - urgent issues requiring immediate attention
     */
    CRITICAL("Critical", 4);
    
    private final String displayName;
    private final int level;
    
    TicketPriority(String displayName, int level) {
        this.displayName = displayName;
        this.level = level;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public int getLevel() {
        return level;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}
