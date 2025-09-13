package ma.gov.dgh.helpdesk.security;

import ma.gov.dgh.helpdesk.entity.User;
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
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Development Authentication Provider that handles password validation for database users
 * This is active in dev profile for testing with database users
 */
@Component
@Profile("dev")
public class DevAuthenticationProvider implements AuthenticationProvider {
    
    private final UserService userService;
    
    @Autowired
    public DevAuthenticationProvider(UserService userService) {
        this.userService = userService;
        System.out.println("DevAuthenticationProvider initialized");
    }
    
    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String password = authentication.getCredentials().toString();
        
        System.out.println("DevAuthenticationProvider: Attempting to authenticate user: " + username);
        System.out.println("DevAuthenticationProvider: Password provided: " + (password != null ? "yes" : "no"));
        
        // Find user in database
        Optional<User> userOpt = userService.findByLdapUsername(username);
        
        if (userOpt.isEmpty()) {
            System.out.println("DevAuthenticationProvider: User not found in database: " + username);
            throw new BadCredentialsException("User not found: " + username);
        }
        
        User user = userOpt.get();
        System.out.println("DevAuthenticationProvider: Found user in database: " + user.getLdapUsername() + " (ID: " + user.getId() + ")");
        
        if (!user.getIsActive()) {
            System.out.println("DevAuthenticationProvider: User account is deactivated: " + username);
            throw new BadCredentialsException("User account is deactivated: " + username);
        }
        
        // For development, accept "password" as the password for all users
        if (!"password".equals(password)) {
            System.out.println("DevAuthenticationProvider: Invalid password for user: " + username + " (expected: 'password', got: '" + password + "')");
            throw new BadCredentialsException("Invalid password for user: " + username);
        }
        
        System.out.println("DevAuthenticationProvider: Password validation successful for user: " + username);
        
        // Create authorities
        List<GrantedAuthority> authorities = createAuthorities(user);
        
        // Create CustomUserDetails
        CustomUserDetails userDetails = new CustomUserDetails(user, authorities);
        
        // Return authenticated token
        System.out.println("DevAuthenticationProvider: Authentication successful for user: " + username);
        return new UsernamePasswordAuthenticationToken(userDetails, password, authorities);
    }
    
    @Override
    public boolean supports(Class<?> authentication) {
        boolean supports = authentication.equals(UsernamePasswordAuthenticationToken.class);
        System.out.println("DevAuthenticationProvider: supports(" + authentication.getSimpleName() + ") = " + supports);
        return supports;
    }
    
    /**
     * Create authorities based on user role
     */
    private List<GrantedAuthority> createAuthorities(User user) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        
        // Handle the actual role values from database
        String roleName = user.getRole().name();
        System.out.println("DevAuthenticationProvider: User role from database: " + roleName);
        
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
        
        System.out.println("DevAuthenticationProvider: Created authorities: " + authorities);
        return authorities;
    }
} 