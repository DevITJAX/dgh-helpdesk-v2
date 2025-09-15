package ma.gov.dgh.helpdesk.security;

import ma.gov.dgh.helpdesk.config.LdapConfig;
import ma.gov.dgh.helpdesk.entity.User;
import ma.gov.dgh.helpdesk.entity.UserRole;
import ma.gov.dgh.helpdesk.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.naming.Context;
import javax.naming.NamingException;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;
import java.util.Optional;

/**
 * Custom LDAP authentication provider that integrates with the User entity
 */
@Component
@Profile("prod") // Only active in production profile
public class CustomLdapAuthenticationProvider implements AuthenticationProvider {
    
    private final UserService userService;
    private final LdapConfig ldapConfig;
    private final LdapGroupMappingService ldapGroupMappingService;
    
    @Autowired
    public CustomLdapAuthenticationProvider(UserService userService, LdapConfig ldapConfig, LdapGroupMappingService ldapGroupMappingService) {
        this.userService = userService;
        this.ldapConfig = ldapConfig;
        this.ldapGroupMappingService = ldapGroupMappingService;
    }
    
    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String password = authentication.getCredentials().toString();
        
        System.out.println("=== LDAP Authentication Started ===");
        System.out.println("Username: " + username);
        
        try {
            // Authenticate against LDAP
            System.out.println("Attempting LDAP authentication...");
            if (authenticateWithLdap(username, password)) {
                System.out.println("LDAP authentication successful!");
                
                // Get or create user in database
                System.out.println("Getting or creating user in database...");
                User user = getOrCreateUser(username);
                System.out.println("User retrieved/created: " + user);
                
                if (!user.getIsActive()) {
                    System.out.println("User account is deactivated: " + username);
                    throw new BadCredentialsException("User account is deactivated");
                }
                
                // Update last login
                System.out.println("Updating last login...");
                userService.updateLastLogin(username);
                
                // Create authorities based on user role
                System.out.println("Creating authorities for role: " + user.getRole());
                List<GrantedAuthority> authorities = createAuthorities(user);
                System.out.println("Authorities created: " + authorities);
                
                // Create UserDetails
                System.out.println("Creating CustomUserDetails...");
                UserDetails userDetails = new CustomUserDetails(user, authorities);
                System.out.println("CustomUserDetails created: " + userDetails);
                
                System.out.println("=== LDAP Authentication Completed Successfully ===");
                return new UsernamePasswordAuthenticationToken(userDetails, password, authorities);
            } else {
                System.out.println("LDAP authentication failed for user: " + username);
                throw new BadCredentialsException("Invalid credentials");
            }
        } catch (Exception e) {
            System.err.println("LDAP Authentication error: " + e.getMessage());
            e.printStackTrace();
            throw new BadCredentialsException("Authentication failed: " + e.getMessage());
        }
    }
    
    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
    
    /**
     * Authenticate user against LDAP server
     */
    private boolean authenticateWithLdap(String username, String password) {
        try {
            // LDAP connection properties for Azure Windows Server
            Hashtable<String, String> env = new Hashtable<>();
            env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
            env.put(Context.PROVIDER_URL, ldapConfig.getUrl());
            env.put(Context.SECURITY_AUTHENTICATION, "simple");
            env.put(Context.SECURITY_PRINCIPAL, username + "@" + ldapConfig.getDomain());
            env.put(Context.SECURITY_CREDENTIALS, password);
            env.put(Context.REFERRAL, "follow"); // Follow referrals
            env.put("com.sun.jndi.ldap.connect.timeout", "5000"); // 5 second timeout
            env.put("com.sun.jndi.ldap.read.timeout", "5000"); // 5 second read timeout
            
            // Attempt to create context (authenticate)
            DirContext ctx = new InitialDirContext(env);
            ctx.close();
            return true;
        } catch (NamingException e) {
            System.err.println("LDAP Authentication failed for user: " + username + " - " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Get existing user or create new one from LDAP
     */
    private User getOrCreateUser(String ldapUsername) {
        System.out.println("Getting or creating user for LDAP username: " + ldapUsername);
        
        Optional<User> existingUser = userService.findByLdapUsername(ldapUsername);
        
        if (existingUser.isPresent()) {
            System.out.println("Found existing user: " + existingUser.get());
            
            // For existing users, check if we should update their role based on current LDAP groups
            User user = existingUser.get();
            LdapUserInfo ldapInfo = fetchUserFromLdap(ldapUsername);
            
            if (ldapInfo.getGroups() != null && !ldapInfo.getGroups().isEmpty()) {
                UserRole newRole = ldapGroupMappingService.determineRoleFromGroups(ldapUsername, ldapInfo.getGroups());
                if (newRole != null && newRole != user.getRole()) {
                    System.out.println("Updating user role from " + user.getRole() + " to " + newRole + " based on LDAP groups");
                    user.setRole(newRole);
                    userService.updateUser(user);
                }
            }
            
            return user;
        } else {
            System.out.println("No existing user found, creating new user...");
            
            // Try to fetch user information from LDAP first
            LdapUserInfo ldapInfo = fetchUserFromLdap(ldapUsername);
            
            String email = ldapInfo.getEmail() != null ? ldapInfo.getEmail() : ldapUsername + "@dgh.gov.ma";
            String fullName = ldapInfo.getFullName() != null ? ldapInfo.getFullName() : ldapUsername;
            String department = ldapInfo.getDepartment() != null ? ldapInfo.getDepartment() : "IT Department";
            
            // Determine role based on LDAP groups first, then fallback to username mapping
            UserRole role;
            if (ldapInfo.getGroups() != null && !ldapInfo.getGroups().isEmpty()) {
                role = ldapGroupMappingService.determineRoleFromGroups(ldapUsername, ldapInfo.getGroups());
                if (role != null) {
                    System.out.println("User role determined from LDAP groups: " + role);
                } else {
                    role = determineUserRoleSimple(ldapUsername);
                    System.out.println("No LDAP group match found, using username mapping: " + role);
                }
            } else {
                role = determineUserRoleSimple(ldapUsername);
                System.out.println("No LDAP groups found, using username mapping: " + role);
            }
            
            System.out.println("Creating user with - Email: " + email + ", FullName: " + fullName + ", Department: " + department + ", Role: " + role);
            
            User newUser = userService.synchronizeFromLdap(ldapUsername, email, fullName, department, role);
            System.out.println("User synchronized from LDAP: " + newUser);
            
            return newUser;
        }
    }
    
    /**
     * Simple role determination based on username
     */
    private UserRole determineUserRoleSimple(String username) {
        System.out.println("Determining role for user: " + username);
        
        // Based on the provided credentials, map users to roles
        switch (username.toLowerCase()) {
            case "aalami":
            case "fbenali":
                System.out.println("User " + username + " assigned ADMIN role");
                return UserRole.ADMIN;
            case "ochakir":
            case "amansouri":
                System.out.println("User " + username + " assigned TECHNICIAN role");
                return UserRole.TECHNICIAN;
            case "yidrissi":
            case "ktazi":
            default:
                System.out.println("User " + username + " assigned EMPLOYEE role (default)");
                return UserRole.EMPLOYEE;
        }
    }
    
    /**
     * Fetch user information from LDAP
     */
    private LdapUserInfo fetchUserFromLdap(String username) {
        System.out.println("Fetching user information from LDAP for: " + username);
        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
            env.put(Context.PROVIDER_URL, ldapConfig.getUrl());
            env.put(Context.SECURITY_AUTHENTICATION, "simple");
            // Use the bind user credentials for queries
            env.put(Context.SECURITY_PRINCIPAL, ldapConfig.getBindUser());
            env.put(Context.SECURITY_CREDENTIALS, ldapConfig.getBindPassword());
            env.put(Context.REFERRAL, "follow");
            env.put("com.sun.jndi.ldap.connect.timeout", "5000");
            env.put("com.sun.jndi.ldap.read.timeout", "5000");
            
            System.out.println("Connecting to LDAP with bind user: " + ldapConfig.getBindUser());
            DirContext ctx = new InitialDirContext(env);
            System.out.println("LDAP connection successful");
            
            // Search for user
            String searchBase = ldapConfig.getSearchBase();
            String searchFilter = "(&(objectClass=user)(sAMAccountName=" + username + "))";
            System.out.println("Searching with filter: " + searchFilter + " in base: " + searchBase);
            
            javax.naming.directory.SearchControls searchControls = new javax.naming.directory.SearchControls();
            searchControls.setSearchScope(javax.naming.directory.SearchControls.SUBTREE_SCOPE);
            searchControls.setReturningAttributes(new String[]{"displayName", "mail", "department", "memberOf"});
            
            javax.naming.NamingEnumeration<javax.naming.directory.SearchResult> results = 
                ctx.search(searchBase, searchFilter, searchControls);
            
            LdapUserInfo userInfo = new LdapUserInfo();
            
            if (results.hasMore()) {
                javax.naming.directory.SearchResult result = results.next();
                javax.naming.directory.Attributes attrs = result.getAttributes();
                System.out.println("Found user in LDAP, processing attributes...");
                
                if (attrs.get("displayName") != null) {
                    userInfo.setFullName(attrs.get("displayName").get().toString());
                    System.out.println("Display Name: " + userInfo.getFullName());
                }
                if (attrs.get("mail") != null) {
                    userInfo.setEmail(attrs.get("mail").get().toString());
                    System.out.println("Email: " + userInfo.getEmail());
                }
                if (attrs.get("department") != null) {
                    userInfo.setDepartment(attrs.get("department").get().toString());
                    System.out.println("Department: " + userInfo.getDepartment());
                }
                if (attrs.get("memberOf") != null) {
                    javax.naming.NamingEnumeration<?> groups = attrs.get("memberOf").getAll();
                    int groupCount = 0;
                    while (groups.hasMore()) {
                        String group = groups.next().toString();
                        userInfo.addGroup(group);
                        groupCount++;
                        System.out.println("User is member of group: " + group);
                    }
                    System.out.println("Total groups found: " + groupCount);
                } else {
                    System.out.println("No memberOf attribute found for user");
                }
            } else {
                System.out.println("No user found in LDAP with username: " + username);
            }
            
            ctx.close();
            System.out.println("LDAP user info fetch completed. Groups: " + userInfo.getGroups());
            return userInfo;
            
        } catch (Exception e) {
            System.err.println("Failed to fetch user info from LDAP for: " + username + " - " + e.getMessage());
            e.printStackTrace();
            return new LdapUserInfo(); // Return empty info
        }
    }
    
    /**
     * Determine user role based on LDAP groups
     */
    private UserRole determineUserRole(String username, LdapUserInfo ldapInfo) {
        // Log user groups for debugging
        System.out.println("Determining role for user: " + username);
        System.out.println("User LDAP groups: " + ldapInfo.getGroups());
        
        // Check LDAP groups first - using flexible matching
        for (String group : ldapInfo.getGroups()) {
            String groupLower = group.toLowerCase();
            System.out.println("Checking group: " + group + " (lowercase: " + groupLower + ")");
            
            // Check for admin groups - match your exact LDAP group names
            if (groupLower.contains("helpdesk_admin") || 
                groupLower.contains("dgh admin group")) {
                System.out.println("User " + username + " assigned ADMIN role based on group: " + group);
                return UserRole.ADMIN;
            }
            
            // Check for technician groups - match your exact LDAP group names
            if (groupLower.contains("helpdesk_tech") || 
                groupLower.contains("dgh tech group")) {
                System.out.println("User " + username + " assigned TECHNICIAN role based on group: " + group);
                return UserRole.TECHNICIAN;
            }

            // Check for employee groups - match your exact LDAP group names
            if (groupLower.contains("helpdesk_user") || 
                groupLower.contains("dgh user group")) {
                System.out.println("User " + username + " assigned EMPLOYEE role based on group: " + group);
                return UserRole.EMPLOYEE;
            }
        }
        
        // Fallback to username-based mapping for existing users
        System.out.println("No matching LDAP groups found, using username-based mapping for: " + username);
        switch (username.toLowerCase()) {
            case "aalami":
            case "fbenali":
            case "ybenkirane":  // Add your username as ADMIN
                System.out.println("User " + username + " assigned ADMIN role based on username");
                return UserRole.ADMIN;
            case "ochakir":
            case "amansouri":
                System.out.println("User " + username + " assigned TECHNICIAN role based on username");
                return UserRole.TECHNICIAN;
            case "yidrissi":
            case "ktazi":
            default:
                System.out.println("User " + username + " assigned EMPLOYEE role (default)");
                return UserRole.EMPLOYEE;
        }
    }
    
    /**
     * Inner class to hold LDAP user information
     */
    private static class LdapUserInfo {
        private String fullName;
        private String email;
        private String department;
        private java.util.List<String> groups = new java.util.ArrayList<>();
        
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        
        public java.util.List<String> getGroups() { return groups; }
        public void addGroup(String group) { this.groups.add(group); }
    }
    
    /**
     * Create authorities based on user role
     */
    private List<GrantedAuthority> createAuthorities(User user) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        
        switch (user.getRole()) {
            case ADMIN:
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                authorities.add(new SimpleGrantedAuthority("ROLE_TECHNICIAN"));
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                break;
            case TECHNICIAN:
                authorities.add(new SimpleGrantedAuthority("ROLE_TECHNICIAN"));
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                break;
            case EMPLOYEE:
            default:
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                break;
        }
        
        return authorities;
    }
}
