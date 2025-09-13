package ma.gov.dgh.helpdesk.security;

import ma.gov.dgh.helpdesk.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Custom UserDetails implementation that wraps the User entity
 */
public class CustomUserDetails implements UserDetails {
    
    private final User user;
    private final List<GrantedAuthority> authorities;
    
    public CustomUserDetails(User user, List<GrantedAuthority> authorities) {
        this.user = user;
        this.authorities = authorities;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
    
    @Override
    public String getPassword() {
        // Password is handled by LDAP, return empty string
        return "";
    }
    
    @Override
    public String getUsername() {
        return user.getLdapUsername();
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return user.getIsActive();
    }
    
    /**
     * Get the wrapped User entity
     */
    public User getUser() {
        return user;
    }
    
    /**
     * Get user ID
     */
    public Long getUserId() {
        return user.getId();
    }
    
    /**
     * Get user full name
     */
    public String getFullName() {
        return user.getFullName();
    }
    
    /**
     * Get user email
     */
    public String getEmail() {
        return user.getEmail();
    }
    
    /**
     * Get user department
     */
    public String getDepartment() {
        return user.getDepartment();
    }
    
    /**
     * Get user role
     */
    public String getRole() {
        return user.getRole().name();
    }
    
    /**
     * Check if user is admin
     */
    public boolean isAdmin() {
        return user.isAdmin();
    }
    
    /**
     * Check if user is technician
     */
    public boolean isTechnician() {
        return user.isTechnician();
    }
}
