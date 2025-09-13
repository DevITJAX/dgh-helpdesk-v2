package ma.gov.dgh.helpdesk.utils;

import ma.gov.dgh.helpdesk.entity.Ticket;
import ma.gov.dgh.helpdesk.entity.User;
import ma.gov.dgh.helpdesk.security.CustomUserDetails;
import ma.gov.dgh.helpdesk.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Utility class for security-related operations
 * Provides helper methods for accessing current user information
 */
@Component
public class SecurityUtils {

    private static UserService userService;

    @Autowired
    public SecurityUtils(UserService userService) {
        SecurityUtils.userService = userService;
    }

    /**
     * Get the currently authenticated user entity
     *
     * @return Optional containing the current User entity, or empty if not authenticated
     */
    public static Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
            "anonymousUser".equals(authentication.getPrincipal())) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) principal;
            return userService.findById(userDetails.getUserId());
        }

        return Optional.empty();
    }

    /**
     * Get the currently authenticated user entity or throw an exception
     *
     * @return The current User entity
     * @throws IllegalStateException if no user is authenticated
     */
    public static User getCurrentUserOrThrow() {
        return getCurrentUser()
            .orElseThrow(() -> new IllegalStateException("No authenticated user found"));
    }

    /**
     * Check if the current user has a specific role
     *
     * @param role The role to check for
     * @return true if the user has the role, false otherwise
     */
    public static boolean hasRole(String role) {
        return getCurrentUser()
            .map(user -> user.getRole().name().equals(role))
            .orElse(false);
    }

    /**
     * Check if the current user is an employee
     *
     * @return true if the user is an employee, false otherwise
     */
    public static boolean isEmployee() {
        return hasRole("EMPLOYEE");
    }

    /**
     * Check if the current user is a technician
     *
     * @return true if the user is a technician, false otherwise
     */
    public static boolean isTechnician() {
        return hasRole("TECHNICIAN");
    }

    /**
     * Check if the current user is an admin
     *
     * @return true if the user is an admin, false otherwise
     */
    public static boolean isAdmin() {
        return hasRole("ADMIN");
    }

    /**
     * Check if the current user can access a ticket
     *
     * @param ticket The ticket to check access for
     * @return true if the user can access the ticket, false otherwise
     */
    public static boolean canAccessTicket(Ticket ticket) {
        Optional<User> currentUser = getCurrentUser();
        if (currentUser.isEmpty()) {
            return false;
        }

        User user = currentUser.get();

        // Admins can access all tickets
        if (isAdmin()) {
            return true;
        }

        // Technicians can access tickets assigned to them or tickets they created
        if (isTechnician()) {
            return (ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(user.getId())) ||
                   (ticket.getCreatedBy() != null && ticket.getCreatedBy().getId().equals(user.getId()));
        }

        // Employees can only access tickets they created
        if (isEmployee()) {
            return ticket.getCreatedBy() != null && ticket.getCreatedBy().getId().equals(user.getId());
        }

        return false;
    }
}