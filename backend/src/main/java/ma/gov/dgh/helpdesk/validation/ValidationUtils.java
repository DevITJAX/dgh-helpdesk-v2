package ma.gov.dgh.helpdesk.validation;

import java.util.regex.Pattern;

/**
 * Utility class for common validation operations
 */
public class ValidationUtils {
    
    // Regular expressions for validation
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
    );
    
    private static final Pattern IP_ADDRESS_PATTERN = Pattern.compile(
        "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
    );
    
    private static final Pattern MAC_ADDRESS_PATTERN = Pattern.compile(
        "^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
    );
    
    private static final Pattern HOSTNAME_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?$"
    );
    
    private static final Pattern LDAP_USERNAME_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._-]{3,50}$"
    );
    
    /**
     * Validate email address format
     */
    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * Validate IP address format
     */
    public static boolean isValidIpAddress(String ipAddress) {
        return ipAddress != null && IP_ADDRESS_PATTERN.matcher(ipAddress).matches();
    }
    
    /**
     * Validate MAC address format
     */
    public static boolean isValidMacAddress(String macAddress) {
        return macAddress != null && MAC_ADDRESS_PATTERN.matcher(macAddress).matches();
    }
    
    /**
     * Validate hostname format
     */
    public static boolean isValidHostname(String hostname) {
        return hostname != null && HOSTNAME_PATTERN.matcher(hostname).matches();
    }
    
    /**
     * Validate LDAP username format
     */
    public static boolean isValidLdapUsername(String username) {
        return username != null && LDAP_USERNAME_PATTERN.matcher(username).matches();
    }
    
    /**
     * Validate string is not null or empty
     */
    public static boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }
    
    /**
     * Validate string length is within range
     */
    public static boolean isValidLength(String value, int minLength, int maxLength) {
        if (value == null) return false;
        int length = value.length();
        return length >= minLength && length <= maxLength;
    }
    
    /**
     * Validate phone number format (basic validation)
     */
    public static boolean isValidPhoneNumber(String phoneNumber) {
        if (phoneNumber == null) return false;
        // Remove all non-digit characters
        String digits = phoneNumber.replaceAll("[^0-9]", "");
        // Check if it has 10-15 digits
        return digits.length() >= 10 && digits.length() <= 15;
    }
    
    /**
     * Sanitize string input to prevent XSS
     */
    public static String sanitizeInput(String input) {
        if (input == null) return null;
        
        return input
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#x27;")
            .replace("/", "&#x2F;")
            .replace("&", "&amp;");
    }
    
    /**
     * Validate ticket title
     */
    public static boolean isValidTicketTitle(String title) {
        return isNotEmpty(title) && isValidLength(title, 5, 255);
    }
    
    /**
     * Validate ticket description
     */
    public static boolean isValidTicketDescription(String description) {
        return description == null || description.length() <= 5000;
    }
    
    /**
     * Validate equipment asset tag
     */
    public static boolean isValidAssetTag(String assetTag) {
        if (assetTag == null) return true; // Optional field
        return Pattern.matches("^[A-Z0-9-]{3,20}$", assetTag);
    }
    
    /**
     * Validate department name
     */
    public static boolean isValidDepartment(String department) {
        return department == null || (isValidLength(department, 2, 100) && 
               Pattern.matches("^[a-zA-Z0-9\\s\\-&.]+$", department));
    }
    
    /**
     * Validate location name
     */
    public static boolean isValidLocation(String location) {
        return location == null || (isValidLength(location, 2, 255) && 
               Pattern.matches("^[a-zA-Z0-9\\s\\-,.()]+$", location));
    }
    
    /**
     * Validate manufacturer name
     */
    public static boolean isValidManufacturer(String manufacturer) {
        return manufacturer == null || (isValidLength(manufacturer, 2, 100) && 
               Pattern.matches("^[a-zA-Z0-9\\s\\-&.]+$", manufacturer));
    }
    
    /**
     * Validate model name
     */
    public static boolean isValidModel(String model) {
        return model == null || (isValidLength(model, 1, 100) && 
               Pattern.matches("^[a-zA-Z0-9\\s\\-_.]+$", model));
    }
    
    /**
     * Validate serial number
     */
    public static boolean isValidSerialNumber(String serialNumber) {
        return serialNumber == null || (isValidLength(serialNumber, 3, 100) && 
               Pattern.matches("^[a-zA-Z0-9\\-_]+$", serialNumber));
    }
    
    /**
     * Validate operating system name
     */
    public static boolean isValidOsName(String osName) {
        return osName == null || (isValidLength(osName, 2, 100) && 
               Pattern.matches("^[a-zA-Z0-9\\s\\-.]+$", osName));
    }
    
    /**
     * Validate operating system version
     */
    public static boolean isValidOsVersion(String osVersion) {
        return osVersion == null || (isValidLength(osVersion, 1, 100) && 
               Pattern.matches("^[a-zA-Z0-9\\s\\-._]+$", osVersion));
    }
    
    /**
     * Validate full name
     */
    public static boolean isValidFullName(String fullName) {
        return fullName == null || (isValidLength(fullName, 2, 255) && 
               Pattern.matches("^[a-zA-ZÀ-ÿ\\s\\-.']+$", fullName));
    }
    
    /**
     * Validate comment content
     */
    public static boolean isValidComment(String comment) {
        return isNotEmpty(comment) && comment.length() <= 5000;
    }
    
    /**
     * Validate escalation reason
     */
    public static boolean isValidEscalationReason(String reason) {
        return isNotEmpty(reason) && isValidLength(reason, 10, 500);
    }
    
    /**
     * Validate positive integer
     */
    public static boolean isValidPositiveInteger(Integer value) {
        return value != null && value > 0;
    }
    
    /**
     * Validate non-negative integer
     */
    public static boolean isValidNonNegativeInteger(Integer value) {
        return value != null && value >= 0;
    }
    
    /**
     * Validate customer satisfaction rating (1-5)
     */
    public static boolean isValidSatisfactionRating(Integer rating) {
        return rating != null && rating >= 1 && rating <= 5;
    }
    
    /**
     * Validate subnet format (CIDR notation)
     */
    public static boolean isValidSubnet(String subnet) {
        if (subnet == null) return false;
        
        String[] parts = subnet.split("/");
        if (parts.length != 2) return false;
        
        // Validate IP part
        if (!isValidIpAddress(parts[0])) return false;
        
        // Validate CIDR part
        try {
            int cidr = Integer.parseInt(parts[1]);
            return cidr >= 0 && cidr <= 32;
        } catch (NumberFormatException e) {
            return false;
        }
    }
    
    /**
     * Validate SNMP community string
     */
    public static boolean isValidSnmpCommunity(String community) {
        return isNotEmpty(community) && isValidLength(community, 1, 50) && 
               Pattern.matches("^[a-zA-Z0-9_-]+$", community);
    }
    
    /**
     * Validate timeout value (in milliseconds)
     */
    public static boolean isValidTimeout(Long timeout) {
        return timeout != null && timeout >= 1000 && timeout <= 60000; // 1 second to 1 minute
    }
}
