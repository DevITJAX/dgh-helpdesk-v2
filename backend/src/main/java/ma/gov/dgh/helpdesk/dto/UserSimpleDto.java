package ma.gov.dgh.helpdesk.dto;

import ma.gov.dgh.helpdesk.entity.User;
import ma.gov.dgh.helpdesk.entity.UserRole;

public class UserSimpleDto {
    private Long id;
    private String ldapUsername;
    private String fullName;
    private String email;
    private String department;
    private UserRole role;
    private Boolean isActive;

    public UserSimpleDto(User user) {
        this.id = user.getId();
        this.ldapUsername = user.getLdapUsername();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.department = user.getDepartment();
        this.role = user.getRole();
        this.isActive = user.getIsActive();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLdapUsername() { return ldapUsername; }
    public void setLdapUsername(String ldapUsername) { this.ldapUsername = ldapUsername; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
} 