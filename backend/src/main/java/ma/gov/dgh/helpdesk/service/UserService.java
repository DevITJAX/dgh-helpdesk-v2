package ma.gov.dgh.helpdesk.service;

import ma.gov.dgh.helpdesk.entity.User;
import ma.gov.dgh.helpdesk.entity.UserRole;
import ma.gov.dgh.helpdesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import ma.gov.dgh.helpdesk.dto.UserAdminDto;

/**
 * Service class for User entity operations
 */
@Service
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    
    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    /**
     * Create a new user
     */
    public User createUser(User user) {
        if (userRepository.existsByLdapUsername(user.getLdapUsername())) {
            throw new IllegalArgumentException("User with LDAP username already exists: " + user.getLdapUsername());
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("User with email already exists: " + user.getEmail());
        }
        return userRepository.save(user);
    }
    
    /**
     * Update an existing user
     */
    public User updateUser(User user) {
        if (user.getId() == null) {
            throw new IllegalArgumentException("User ID cannot be null for update operation");
        }
        
        Optional<User> existingUser = userRepository.findById(user.getId());
        if (existingUser.isEmpty()) {
            throw new IllegalArgumentException("User not found with ID: " + user.getId());
        }
        
        // Check for duplicate LDAP username (excluding current user)
        Optional<User> userWithSameLdap = userRepository.findByLdapUsername(user.getLdapUsername());
        if (userWithSameLdap.isPresent() && !userWithSameLdap.get().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Another user with LDAP username already exists: " + user.getLdapUsername());
        }
        
        // Check for duplicate email (excluding current user)
        Optional<User> userWithSameEmail = userRepository.findByEmail(user.getEmail());
        if (userWithSameEmail.isPresent() && !userWithSameEmail.get().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Another user with email already exists: " + user.getEmail());
        }
        
        return userRepository.save(user);
    }
    
    /**
     * Find user by ID
     */
    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    /**
     * Find user by LDAP username
     */
    @Transactional(readOnly = true)
    public Optional<User> findByLdapUsername(String ldapUsername) {
        return userRepository.findByLdapUsername(ldapUsername);
    }
    
    /**
     * Find user by email
     */
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    /**
     * Get all users
     */
    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    /**
     * Get all active users
     */
    @Transactional(readOnly = true)
    public List<User> findActiveUsers() {
        return userRepository.findByIsActiveTrue();
    }
    
    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public List<User> findByRole(UserRole role) {
        return userRepository.findByRole(role);
    }
    
    /**
     * Get active users by role
     */
    @Transactional(readOnly = true)
    public List<User> findActiveUsersByRole(UserRole role) {
        return userRepository.findByRoleAndIsActiveTrue(role);
    }
    
    /**
     * Get all technicians (users with TECHNICIAN or ADMIN role)
     */
    @Transactional(readOnly = true)
    public List<User> findAllTechnicians() {
        return userRepository.findAllTechnicians();
    }
    
    /**
     * Get users by department
     */
    @Transactional(readOnly = true)
    public List<User> findByDepartment(String department) {
        return userRepository.findByDepartment(department);
    }
    
    /**
     * Get active users by department
     */
    @Transactional(readOnly = true)
    public List<User> findActiveUsersByDepartment(String department) {
        return userRepository.findByDepartmentAndIsActiveTrue(department);
    }
    
    /**
     * Search users by name
     */
    @Transactional(readOnly = true)
    public List<User> searchByName(String name) {
        return userRepository.findByFullNameContainingIgnoreCase(name);
    }
    
    /**
     * Get users with filters and pagination
     */
    @Transactional(readOnly = true)
    public Page<User> findUsersWithFilters(String search, String department, UserRole role, 
                                          Boolean isActive, Pageable pageable) {
        return userRepository.findUsersWithFilters(search, department, role, isActive, pageable);
    }
    
    /**
     * Deactivate user
     */
    public User deactivateUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }
        
        User user = userOpt.get();
        user.setIsActive(false);
        return userRepository.save(user);
    }
    
    /**
     * Activate user
     */
    public User activateUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }
        
        User user = userOpt.get();
        user.setIsActive(true);
        return userRepository.save(user);
    }
    
    /**
     * Update user's last login time
     */
    public User updateLastLogin(String ldapUsername) {
        Optional<User> userOpt = userRepository.findByLdapUsername(ldapUsername);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found with LDAP username: " + ldapUsername);
        }
        
        User user = userOpt.get();
        user.setLastLogin(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    /**
     * Change user role
     */
    public User changeUserRole(Long userId, UserRole newRole) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }
        
        User user = userOpt.get();
        user.setRole(newRole);
        return userRepository.save(user);
    }
    
    /**
     * Delete user (soft delete by deactivating)
     */
    public void deleteUser(Long userId) {
        deactivateUser(userId);
    }
    
    /**
     * Get user statistics
     */
    @Transactional(readOnly = true)
    public UserStatistics getUserStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActiveTrue();
        long adminUsers = userRepository.countByRole(UserRole.ADMIN);
        long technicianUsers = userRepository.countByRole(UserRole.TECHNICIAN);
        long employeeUsers = userRepository.countByRole(UserRole.EMPLOYEE);
        
        return new UserStatistics(totalUsers, activeUsers, adminUsers, technicianUsers, employeeUsers);
    }
    
    /**
     * Check if user exists by LDAP username
     */
    @Transactional(readOnly = true)
    public boolean existsByLdapUsername(String ldapUsername) {
        return userRepository.existsByLdapUsername(ldapUsername);
    }
    
    /**
     * Check if user exists by email
     */
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    /**
     * Synchronize user from LDAP (create or update)
     */
    public User synchronizeFromLdap(String ldapUsername, String email, String fullName, String department) {
        return synchronizeFromLdap(ldapUsername, email, fullName, department, UserRole.EMPLOYEE);
    }
    
    /**
     * Synchronize user from LDAP (create or update) with specific role
     */
    public User synchronizeFromLdap(String ldapUsername, String email, String fullName, String department, UserRole role) {
        Optional<User> existingUser = userRepository.findByLdapUsername(ldapUsername);
        
        if (existingUser.isPresent()) {
            // Update existing user
            User user = existingUser.get();
            user.setEmail(email);
            user.setFullName(fullName);
            user.setDepartment(department);
            user.setRole(role); // Update role if provided
            user.setIsActive(true); // Reactivate if was deactivated
            return userRepository.save(user);
        } else {
            // Create new user
            User newUser = new User(ldapUsername, email, fullName);
            newUser.setDepartment(department);
            newUser.setRole(role); // Use provided role
            return userRepository.save(newUser);
        }
    }
    
    /**
     * Get all users for admin (with optional search, role, isActive filters)
     */
    @Transactional(readOnly = true)
    public List<UserAdminDto> getAllUsersForAdmin(String search, String role, Boolean isActive) {
        List<User> users = userRepository.findAll();
        return users.stream()
            .filter(u -> (search == null || u.getFullName().toLowerCase().contains(search.toLowerCase()) || u.getLdapUsername().toLowerCase().contains(search.toLowerCase()) || (u.getEmail() != null && u.getEmail().toLowerCase().contains(search.toLowerCase())))
                && (role == null || u.getRole().name().equalsIgnoreCase(role))
                && (isActive == null || u.getIsActive().equals(isActive)))
            .map(u -> {
                UserAdminDto dto = new UserAdminDto();
                dto.setId(u.getId());
                dto.setLdapUsername(u.getLdapUsername());
                dto.setFullName(u.getFullName());
                dto.setEmail(u.getEmail());
                dto.setDepartment(u.getDepartment());
                dto.setRole(u.getRole() != null ? u.getRole().name() : null);
                dto.setIsActive(u.getIsActive());
                return dto;
            })
            .toList();
    }
    
    /**
     * Inner class for user statistics
     */
    public static class UserStatistics {
        private final long totalUsers;
        private final long activeUsers;
        private final long adminUsers;
        private final long technicianUsers;
        private final long employeeUsers;
        
        public UserStatistics(long totalUsers, long activeUsers, long adminUsers, 
                            long technicianUsers, long employeeUsers) {
            this.totalUsers = totalUsers;
            this.activeUsers = activeUsers;
            this.adminUsers = adminUsers;
            this.technicianUsers = technicianUsers;
            this.employeeUsers = employeeUsers;
        }
        
        // Getters
        public long getTotalUsers() { return totalUsers; }
        public long getActiveUsers() { return activeUsers; }
        public long getAdminUsers() { return adminUsers; }
        public long getTechnicianUsers() { return technicianUsers; }
        public long getEmployeeUsers() { return employeeUsers; }
    }
}