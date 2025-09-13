package ma.gov.dgh.helpdesk.repository;

import ma.gov.dgh.helpdesk.entity.User;
import ma.gov.dgh.helpdesk.entity.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity operations
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by LDAP username
     */
    Optional<User> findByLdapUsername(String ldapUsername);
    
    /**
     * Find user by email address
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Find all active users
     */
    List<User> findByIsActiveTrue();
    
    /**
     * Find users by role
     */
    List<User> findByRole(UserRole role);
    
    /**
     * Find active users by role
     */
    List<User> findByRoleAndIsActiveTrue(UserRole role);
    
    /**
     * Find users by department
     */
    List<User> findByDepartment(String department);
    
    /**
     * Find active users by department
     */
    List<User> findByDepartmentAndIsActiveTrue(String department);
    
    /**
     * Find users by full name containing (case-insensitive search)
     */
    List<User> findByFullNameContainingIgnoreCase(String name);
    
    /**
     * Find users created after a specific date
     */
    List<User> findByCreatedAtAfter(LocalDateTime date);
    
    /**
     * Find users who logged in after a specific date
     */
    List<User> findByLastLoginAfter(LocalDateTime date);
    
    /**
     * Find users who never logged in
     */
    List<User> findByLastLoginIsNull();
    
    /**
     * Check if LDAP username exists
     */
    boolean existsByLdapUsername(String ldapUsername);
    
    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);
    
    /**
     * Find all technicians (users with TECHNICIAN or ADMIN role)
     */
    @Query("SELECT u FROM User u WHERE u.role IN ('TECHNICIAN', 'ADMIN') AND u.isActive = true")
    List<User> findAllTechnicians();
    
    /**
     * Find users with pagination and search
     */
    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.ldapUsername) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:department IS NULL OR u.department = :department) AND " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:isActive IS NULL OR u.isActive = :isActive)")
    Page<User> findUsersWithFilters(@Param("search") String search,
                                   @Param("department") String department,
                                   @Param("role") UserRole role,
                                   @Param("isActive") Boolean isActive,
                                   Pageable pageable);
    
    /**
     * Count users by role
     */
    long countByRole(UserRole role);
    
    /**
     * Count active users
     */
    long countByIsActiveTrue();
    
    /**
     * Count users by department
     */
    long countByDepartment(String department);
    
    /**
     * Find users assigned to tickets in a specific time period
     */
    @Query("SELECT DISTINCT u FROM User u JOIN u.assignedTickets t WHERE t.createdAt BETWEEN :startDate AND :endDate")
    List<User> findUsersWithTicketsInPeriod(@Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find users with most created tickets
     */
    @Query("SELECT u FROM User u LEFT JOIN u.createdTickets t GROUP BY u ORDER BY COUNT(t) DESC")
    List<User> findUsersOrderByCreatedTicketsCount(Pageable pageable);
    
    /**
     * Find users with most assigned tickets
     */
    @Query("SELECT u FROM User u LEFT JOIN u.assignedTickets t GROUP BY u ORDER BY COUNT(t) DESC")
    List<User> findUsersOrderByAssignedTicketsCount(Pageable pageable);
}
