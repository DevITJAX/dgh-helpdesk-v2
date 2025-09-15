package ma.gov.dgh.helpdesk.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import ma.gov.dgh.helpdesk.entity.UserRole;

import java.util.Arrays;
import java.util.List;

/**
 * Service to handle LDAP group to role mapping
 */
@Service
public class LdapGroupMappingService {
    
    @Value("${ldap.groups.admin:Helpdesk_Admin,DGH Admin Group,helpdesk_admin}")
    private String adminGroups;
    
    @Value("${ldap.groups.technician:Helpdesk_Tech,DGH Tech Group,helpdesk_tech}")
    private String technicianGroups;
    
    @Value("${ldap.groups.employee:Helpdesk_User,DGH User Group,helpdesk_user}")
    private String employeeGroups;
    
    @Value("${ldap.debug.enabled:true}")
    private boolean debugEnabled;
    
    /**
     * Determine user role based on LDAP groups
     */
    public UserRole determineRoleFromGroups(String username, List<String> ldapGroups) {
        if (debugEnabled) {
            System.out.println("=== LDAP GROUP MAPPING DEBUG ===");
            System.out.println("Username: " + username);
            System.out.println("LDAP Groups: " + ldapGroups);
            System.out.println("Admin groups config: " + adminGroups);
            System.out.println("Technician groups config: " + technicianGroups);
            System.out.println("Employee groups config: " + employeeGroups);
        }
        
        // Check for admin groups
        if (matchesAnyGroup(ldapGroups, adminGroups)) {
            System.out.println("User " + username + " assigned ADMIN role based on LDAP group membership");
            return UserRole.ADMIN;
        }
        
        // Check for technician groups
        if (matchesAnyGroup(ldapGroups, technicianGroups)) {
            System.out.println("User " + username + " assigned TECHNICIAN role based on LDAP group membership");
            return UserRole.TECHNICIAN;
        }
        
        // Check for employee groups
        if (matchesAnyGroup(ldapGroups, employeeGroups)) {
            System.out.println("User " + username + " assigned EMPLOYEE role based on LDAP group membership");
            return UserRole.EMPLOYEE;
        }
        
        System.out.println("No matching LDAP groups found for user: " + username);
        return null; // No role found from LDAP groups
    }
    
    /**
     * Check if any of the user's LDAP groups match the configured group patterns
     */
    private boolean matchesAnyGroup(List<String> userGroups, String configuredGroups) {
        if (userGroups == null || userGroups.isEmpty() || configuredGroups == null || configuredGroups.trim().isEmpty()) {
            return false;
        }
        
        List<String> groupPatterns = Arrays.asList(configuredGroups.split(","));
        
        for (String userGroup : userGroups) {
            String userGroupLower = userGroup.toLowerCase().trim();
            
            for (String pattern : groupPatterns) {
                String patternLower = pattern.toLowerCase().trim();
                
                if (debugEnabled) {
                    System.out.println("Checking if '" + userGroupLower + "' matches pattern '" + patternLower + "'");
                }
                
                // Check for exact match or contains match
                if (userGroupLower.equals(patternLower) || userGroupLower.contains(patternLower)) {
                    if (debugEnabled) {
                        System.out.println("✓ MATCH FOUND: '" + userGroup + "' matches pattern '" + pattern + "'");
                    }
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Get all configured admin group patterns
     */
    public List<String> getAdminGroupPatterns() {
        return Arrays.asList(adminGroups.split(","));
    }
    
    /**
     * Get all configured technician group patterns
     */
    public List<String> getTechnicianGroupPatterns() {
        return Arrays.asList(technicianGroups.split(","));
    }
    
    /**
     * Get all configured employee group patterns
     */
    public List<String> getEmployeeGroupPatterns() {
        return Arrays.asList(employeeGroups.split(","));
    }
}
