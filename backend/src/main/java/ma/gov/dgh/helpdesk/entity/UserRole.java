package ma.gov.dgh.helpdesk.entity;

/**
 * Enumeration for user roles in the DGH HelpDesk system
 */
public enum UserRole {
    /**
     * Regular employee - can create tickets and view their own tickets
     */
    EMPLOYEE("Employee"),
    
    /**
     * Technician - can be assigned tickets and resolve them
     */
    TECHNICIAN("Technician"),
    
    /**
     * Administrator - full system access
     */
    ADMIN("Administrator");
    
    private final String displayName;
    
    UserRole(String displayName) {
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
