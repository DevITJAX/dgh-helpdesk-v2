package ma.gov.dgh.helpdesk.dto;

public class UserAdminDto {
    private Long id;
    private String ldapUsername;
    private String fullName;
    private String email;
    private String department;
    private String role;
    private Boolean isActive;

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

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
} 