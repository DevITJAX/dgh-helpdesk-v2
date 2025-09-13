package ma.gov.dgh.helpdesk.security;

import ma.gov.dgh.helpdesk.entity.User;
import ma.gov.dgh.helpdesk.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Development UserDetailsService that loads user information from the database
 * This is active in dev profile to provide proper user IDs for testing
 */
@Service
@Profile("dev") // Only active in development profile
public class DevUserDetailsService implements UserDetailsService {
    
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    
    @Autowired
    public DevUserDetailsService(UserService userService) {
        this.userService = userService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOpt = userService.findByLdapUsername(username);
        
        if (userOpt.isEmpty()) {
            throw new UsernameNotFoundException("User not found: " + username);
        }
        
        User user = userOpt.get();
        
        if (!user.getIsActive()) {
            throw new UsernameNotFoundException("User account is deactivated: " + username);
        }
        
        List<GrantedAuthority> authorities = createAuthorities(user);
        
        // For development, we'll create a CustomUserDetails with a default password
        // The actual password validation will be handled by a custom authentication provider
        return new CustomUserDetails(user, authorities);
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