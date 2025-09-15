package ma.gov.dgh.helpdesk.controller;

import ma.gov.dgh.helpdesk.security.LdapGroupMappingService;
import ma.gov.dgh.helpdesk.security.CustomLdapAuthenticationProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for testing LDAP group membership and role assignment
 */
@RestController
@RequestMapping("/api/ldap-test")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class LdapTestController {
    
    @Autowired
    private LdapGroupMappingService ldapGroupMappingService;
    
    @Autowired
    private CustomLdapAuthenticationProvider ldapProvider;
    
    /**
     * Test LDAP group mapping for a specific username
     */
    @GetMapping("/test-groups/{username}")
    public Map<String, Object> testUserGroups(@PathVariable String username) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // This would need to be made public in the LDAP provider
            // For now, we'll just show the configuration
            result.put("username", username);
            result.put("adminGroupPatterns", ldapGroupMappingService.getAdminGroupPatterns());
            result.put("technicianGroupPatterns", ldapGroupMappingService.getTechnicianGroupPatterns());
            result.put("employeeGroupPatterns", ldapGroupMappingService.getEmployeeGroupPatterns());
            result.put("message", "LDAP group mapping configuration loaded successfully");
            result.put("status", "success");
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
            result.put("status", "error");
        }
        
        return result;
    }
    
    /**
     * Get LDAP group mapping configuration
     */
    @GetMapping("/config")
    public Map<String, Object> getLdapConfig() {
        Map<String, Object> result = new HashMap<>();
        
        result.put("adminGroupPatterns", ldapGroupMappingService.getAdminGroupPatterns());
        result.put("technicianGroupPatterns", ldapGroupMappingService.getTechnicianGroupPatterns());
        result.put("employeeGroupPatterns", ldapGroupMappingService.getEmployeeGroupPatterns());
        result.put("status", "success");
        
        return result;
    }
}