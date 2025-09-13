package ma.gov.dgh.helpdesk.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * User entity representing government employees in the DGH HelpDesk system
 * Users are synchronized from LDAP/Active Directory
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_ldap_username", columnList = "ldap_username"),
    @Index(name = "idx_user_email", columnList = "email"),
    @Index(name = "idx_user_department", columnList = "department")
})
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "ldap_username", unique = true, nullable = false, length = 100)
    @NotBlank(message = "LDAP username is required")
    @Size(max = 100, message = "LDAP username must not exceed 100 characters")
    private String ldapUsername;
    
    @Column(name = "email", nullable = false, length = 255)
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;
    
    @Column(name = "full_name", length = 255)
    @Size(max = 255, message = "Full name must not exceed 255 characters")
    private String fullName;
    
    @Column(name = "department", length = 100)
    @Size(max = 100, message = "Department must not exceed 100 characters")
    private String department;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 50)
    private UserRole role = UserRole.EMPLOYEE;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "phone_number", length = 20)
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phoneNumber;
    
    @Column(name = "office_location", length = 100)
    @Size(max = 100, message = "Office location must not exceed 100 characters")
    private String officeLocation;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    // Relationships
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference(value = "user-created-tickets")
    private List<Ticket> createdTickets = new ArrayList<>();
    
    @OneToMany(mappedBy = "assignedTo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference(value = "user-assigned-tickets")
    private List<Ticket> assignedTickets = new ArrayList<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference(value = "user-comments")
    private List<TicketComment> comments = new ArrayList<>();
    
    // Constructors
    public User() {}
    
    public User(String ldapUsername, String email, String fullName) {
        this.ldapUsername = ldapUsername;
        this.email = email;
        this.fullName = fullName;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getLdapUsername() {
        return ldapUsername;
    }
    
    public void setLdapUsername(String ldapUsername) {
        this.ldapUsername = ldapUsername;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getDepartment() {
        return department;
    }
    
    public void setDepartment(String department) {
        this.department = department;
    }
    
    public UserRole getRole() {
        return role;
    }
    
    public void setRole(UserRole role) {
        this.role = role;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getOfficeLocation() {
        return officeLocation;
    }
    
    public void setOfficeLocation(String officeLocation) {
        this.officeLocation = officeLocation;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public LocalDateTime getLastLogin() {
        return lastLogin;
    }
    
    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }
    
    public List<Ticket> getCreatedTickets() {
        return createdTickets;
    }
    
    public void setCreatedTickets(List<Ticket> createdTickets) {
        this.createdTickets = createdTickets;
    }
    
    public List<Ticket> getAssignedTickets() {
        return assignedTickets;
    }
    
    public void setAssignedTickets(List<Ticket> assignedTickets) {
        this.assignedTickets = assignedTickets;
    }
    
    public List<TicketComment> getComments() {
        return comments;
    }
    
    public void setComments(List<TicketComment> comments) {
        this.comments = comments;
    }
    
    // Utility methods
    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }
    
    public boolean isTechnician() {
        return role == UserRole.TECHNICIAN || role == UserRole.ADMIN;
    }
    
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", ldapUsername='" + ldapUsername + '\'' +
                ", email='" + email + '\'' +
                ", fullName='" + fullName + '\'' +
                ", department='" + department + '\'' +
                ", role=" + role +
                ", isActive=" + isActive +
                '}';
    }
}
