package ma.gov.dgh.helpdesk.entity;

/**
 * Enumeration for ticket categories in the DGH HelpDesk system
 */
public enum TicketCategory {
    /**
     * Hardware-related issues
     */
    HARDWARE("Hardware Issue"),
    
    /**
     * Software-related issues
     */
    SOFTWARE("Software Issue"),
    
    /**
     * Network connectivity issues
     */
    NETWORK("Network Issue"),
    
    /**
     * Email-related problems
     */
    EMAIL("Email Issue"),
    
    /**
     * Printer-related issues
     */
    PRINTER("Printer Issue"),
    
    /**
     * Account and access issues
     */
    ACCESS("Access Issue"),
    
    /**
     * New software or hardware requests
     */
    REQUEST("Request"),
    
    /**
     * Security-related incidents
     */
    SECURITY("Security Issue"),
    
    /**
     * Phone system issues
     */
    PHONE("Phone Issue"),
    
    /**
     * General IT support
     */
    GENERAL("General Support"),
    
    /**
     * Other issues not covered by specific categories
     */
    OTHER("Other");
    
    private final String displayName;
    
    TicketCategory(String displayName) {
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
