package ma.gov.dgh.helpdesk.entity;

/**
 * Enumeration for equipment types in the DGH HelpDesk system
 */
public enum EquipmentType {
    /**
     * Desktop computer
     */
    DESKTOP("Desktop Computer"),
    
    /**
     * Laptop computer
     */
    LAPTOP("Laptop Computer"),
    
    /**
     * Server
     */
    SERVER("Server"),
    
    /**
     * Network printer
     */
    PRINTER("Printer"),
    
    /**
     * Network switch
     */
    SWITCH("Network Switch"),
    
    /**
     * Network router
     */
    ROUTER("Router"),
    
    /**
     * Wireless access point
     */
    ACCESS_POINT("Access Point"),
    
    /**
     * Firewall device
     */
    FIREWALL("Firewall"),
    
    /**
     * UPS (Uninterruptible Power Supply)
     */
    UPS("UPS"),
    
    /**
     * Scanner
     */
    SCANNER("Scanner"),
    
    /**
     * Projector
     */
    PROJECTOR("Projector"),
    
    /**
     * Phone (IP Phone)
     */
    PHONE("IP Phone"),
    
    /**
     * Monitor/Display
     */
    MONITOR("Monitor"),
    
    /**
     * Storage device (NAS, SAN)
     */
    STORAGE("Storage Device"),
    
    /**
     * Unknown or unidentified equipment
     */
    UNKNOWN("Unknown");
    
    private final String displayName;
    
    EquipmentType(String displayName) {
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
