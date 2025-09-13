package ma.gov.dgh.helpdesk.entity;

/**
 * Enumeration for ticket status in the DGH HelpDesk system
 */
public enum TicketStatus {
    /**
     * Ticket is newly created and open
     */
    OPEN("Open"),
    
    /**
     * Ticket is assigned and being worked on
     */
    IN_PROGRESS("In Progress"),
    
    /**
     * Ticket is waiting for user response or external dependency
     */
    WAITING("Waiting"),
    
    /**
     * Ticket has been resolved but not yet closed
     */
    RESOLVED("Resolved"),
    
    /**
     * Ticket is closed and completed
     */
    CLOSED("Closed"),
    
    /**
     * Ticket has been escalated to higher priority
     */
    ESCALATED("Escalated"),
    
    /**
     * Ticket has been cancelled
     */
    CANCELLED("Cancelled");
    
    private final String displayName;
    
    TicketStatus(String displayName) {
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
