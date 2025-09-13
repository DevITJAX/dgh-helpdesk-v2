package ma.gov.dgh.helpdesk.controller;

import ma.gov.dgh.helpdesk.entity.User;
import ma.gov.dgh.helpdesk.entity.UserRole;
import ma.gov.dgh.helpdesk.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import ma.gov.dgh.helpdesk.dto.UserAdminDto;
import ma.gov.dgh.helpdesk.dto.UserSimpleDto;
import java.util.stream.Collectors;

/**
 * REST Controller for User operations
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:4200"})
public class UserController {
    
    private final UserService userService;
    
    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    /**
     * Get all users with pagination and filtering
     */
    @GetMapping
    public ResponseEntity<Page<UserSimpleDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Boolean isActive) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<User> users = userService.findUsersWithFilters(search, department, role, isActive, pageable);
        Page<UserSimpleDto> userDtos = users.map(UserSimpleDto::new);
        return ResponseEntity.ok(userDtos);
    }
    
    /**
     * Get user by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.findById(id);
        return user.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get user by LDAP username
     */
    @GetMapping("/ldap/{ldapUsername}")
    public ResponseEntity<User> getUserByLdapUsername(@PathVariable String ldapUsername) {
        Optional<User> user = userService.findByLdapUsername(ldapUsername);
        return user.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get user by email
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.findByEmail(email);
        return user.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get all active users
     */
    @GetMapping("/active")
    public ResponseEntity<List<UserSimpleDto>> getActiveUsers() {
        List<User> users = userService.findActiveUsers();
        List<UserSimpleDto> userDtos = users.stream()
            .map(UserSimpleDto::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }
    
    /**
     * Get users by role
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserSimpleDto>> getUsersByRole(@PathVariable UserRole role) {
        List<User> users = userService.findByRole(role);
        List<UserSimpleDto> userDtos = users.stream()
            .map(UserSimpleDto::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }
    
    /**
     * Get all technicians (users with TECHNICIAN or ADMIN role)
     */
    @GetMapping("/technicians")
    public ResponseEntity<List<UserSimpleDto>> getTechnicians() {
        List<User> technicians = userService.findAllTechnicians();
        List<UserSimpleDto> technicianDtos = technicians.stream()
            .map(UserSimpleDto::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(technicianDtos);
    }
    
    /**
     * Get users by department
     */
    @GetMapping("/department/{department}")
    public ResponseEntity<List<User>> getUsersByDepartment(@PathVariable String department) {
        List<User> users = userService.findByDepartment(department);
        return ResponseEntity.ok(users);
    }
    
    /**
     * Search users by name
     */
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsersByName(@RequestParam String name) {
        List<User> users = userService.searchByName(name);
        return ResponseEntity.ok(users);
    }
    
    /**
     * Create a new user
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        try {
            User createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update an existing user
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @Valid @RequestBody User user) {
        try {
            user.setId(id);
            User updatedUser = userService.updateUser(user);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Activate user
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<User> activateUser(@PathVariable Long id) {
        try {
            User user = userService.activateUser(id);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Deactivate user
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<User> deactivateUser(@PathVariable Long id) {
        try {
            User user = userService.deactivateUser(id);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Change user role
     */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> changeUserRole(@PathVariable Long id, @RequestBody UserRoleRequest request) {
        try {
            User user = userService.changeUserRole(id, request.getRole());
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Update current user's profile
     */
    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        try {
            // For development, we'll use the userId from the request
            // In production, this should use session authentication
            if (request.getUserId() == null) {
                return ResponseEntity.badRequest().build();
            }

            Optional<User> currentUserOpt = userService.findById(request.getUserId());
            
            if (currentUserOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User currentUser = currentUserOpt.get();
            
            // Update allowed profile fields
            currentUser.setFullName(request.getFullName());
            currentUser.setEmail(request.getEmail());
            currentUser.setPhoneNumber(request.getPhoneNumber());
            currentUser.setOfficeLocation(request.getOfficeLocation());
            currentUser.setDepartment(request.getDepartment());
            
            User updatedUser = userService.updateUser(currentUser);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update user's last login
     */
    @PutMapping("/ldap/{ldapUsername}/login")
    public ResponseEntity<User> updateLastLogin(@PathVariable String ldapUsername) {
        try {
            User user = userService.updateLastLogin(ldapUsername);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete user (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Check if LDAP username exists
     */
    @GetMapping("/exists/ldap/{ldapUsername}")
    public ResponseEntity<Boolean> checkLdapUsernameExists(@PathVariable String ldapUsername) {
        boolean exists = userService.existsByLdapUsername(ldapUsername);
        return ResponseEntity.ok(exists);
    }
    
    /**
     * Check if email exists
     */
    @GetMapping("/exists/email/{email}")
    public ResponseEntity<Boolean> checkEmailExists(@PathVariable String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }
    
    /**
     * Get user statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<UserService.UserStatistics> getUserStatistics() {
        UserService.UserStatistics statistics = userService.getUserStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Synchronize user from LDAP
     */
    @PostMapping("/sync/ldap")
    public ResponseEntity<User> synchronizeFromLdap(@RequestBody LdapSyncRequest request) {
        try {
            User user = userService.synchronizeFromLdap(
                request.getLdapUsername(),
                request.getEmail(),
                request.getFullName(),
                request.getDepartment()
            );
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Admin: Get all users (with optional search, role, isActive filters)
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserAdminDto>> getAllUsersForAdmin(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean isActive) {
        List<UserAdminDto> users = userService.getAllUsersForAdmin(search, role, isActive);
        return ResponseEntity.ok(users);
    }
    
    // Inner classes for request DTOs
    
    public static class UserRoleRequest {
        private UserRole role;
        
        public UserRole getRole() {
            return role;
        }
        
        public void setRole(UserRole role) {
            this.role = role;
        }
    }
    
    public static class LdapSyncRequest {
        private String ldapUsername;
        private String email;
        private String fullName;
        private String department;
        
        // Getters and setters
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
    }
    
    public static class ProfileUpdateRequest {
        private Long userId;
        private String fullName;
        private String email;
        private String phoneNumber;
        private String officeLocation;
        private String department;
        
        // Getters and setters
        public Long getUserId() {
            return userId;
        }
        
        public void setUserId(Long userId) {
            this.userId = userId;
        }
        
        public String getFullName() {
            return fullName;
        }
        
        public void setFullName(String fullName) {
            this.fullName = fullName;
        }
        
        public String getEmail() {
            return email;
        }
        
        public void setEmail(String email) {
            this.email = email;
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
        
        public String getDepartment() {
            return department;
        }
        
        public void setDepartment(String department) {
            this.department = department;
        }
    }
}
