package ma.gov.dgh.helpdesk.entity;

/**
 * Enumeration for equipment status in the DGH HelpDesk system
 */
public enum EquipmentStatus {
    /**
     * Equipment is online and responding
     */
    ONLINE("Online"),
    
    /**
     * Equipment is offline or not responding
     */
    OFFLINE("Offline"),
    
    /**
     * Equipment is under maintenance
     */
    MAINTENANCE("Under Maintenance"),
    
    /**
     * Equipment is retired or decommissioned
     */
    RETIRED("Retired"),
    
    /**
     * Equipment status is unknown
     */
    UNKNOWN("Unknown");
    
    private final String displayName;
    
    EquipmentStatus(String displayName) {
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
