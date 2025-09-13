package ma.gov.dgh.helpdesk.exception;

import org.springframework.http.HttpStatus;

/**
 * Custom business exception for DGH HelpDesk application
 */
public class BusinessException extends RuntimeException {
    
    private final String errorCode;
    private final HttpStatus httpStatus;
    
    public BusinessException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = HttpStatus.BAD_REQUEST;
    }
    
    public BusinessException(String errorCode, String message, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }
    
    public BusinessException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = HttpStatus.BAD_REQUEST;
    }
    
    public BusinessException(String errorCode, String message, HttpStatus httpStatus, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
    
    // Common business exceptions
    
    public static class UserNotFoundException extends BusinessException {
        public UserNotFoundException(String userId) {
            super("USER_NOT_FOUND", "User not found: " + userId, HttpStatus.NOT_FOUND);
        }
    }
    
    public static class EquipmentNotFoundException extends BusinessException {
        public EquipmentNotFoundException(String equipmentId) {
            super("EQUIPMENT_NOT_FOUND", "Equipment not found: " + equipmentId, HttpStatus.NOT_FOUND);
        }
    }
    
    public static class TicketNotFoundException extends BusinessException {
        public TicketNotFoundException(String ticketId) {
            super("TICKET_NOT_FOUND", "Ticket not found: " + ticketId, HttpStatus.NOT_FOUND);
        }
    }
    
    public static class DuplicateUserException extends BusinessException {
        public DuplicateUserException(String field, String value) {
            super("DUPLICATE_USER", "User with " + field + " already exists: " + value, HttpStatus.CONFLICT);
        }
    }
    
    public static class DuplicateEquipmentException extends BusinessException {
        public DuplicateEquipmentException(String field, String value) {
            super("DUPLICATE_EQUIPMENT", "Equipment with " + field + " already exists: " + value, HttpStatus.CONFLICT);
        }
    }
    
    public static class InvalidTicketStateException extends BusinessException {
        public InvalidTicketStateException(String currentState, String targetState) {
            super("INVALID_TICKET_STATE", 
                  "Cannot change ticket state from " + currentState + " to " + targetState, 
                  HttpStatus.BAD_REQUEST);
        }
    }
    
    public static class UnauthorizedOperationException extends BusinessException {
        public UnauthorizedOperationException(String operation) {
            super("UNAUTHORIZED_OPERATION", 
                  "You are not authorized to perform this operation: " + operation, 
                  HttpStatus.FORBIDDEN);
        }
    }
    
    public static class NetworkDiscoveryException extends BusinessException {
        public NetworkDiscoveryException(String message) {
            super("NETWORK_DISCOVERY_ERROR", "Network discovery failed: " + message);
        }
    }
    
    public static class LdapAuthenticationException extends BusinessException {
        public LdapAuthenticationException(String message) {
            super("LDAP_AUTH_ERROR", "LDAP authentication failed: " + message, HttpStatus.UNAUTHORIZED);
        }
    }
    
    public static class DatabaseOperationException extends BusinessException {
        public DatabaseOperationException(String operation, String message) {
            super("DATABASE_ERROR", "Database operation failed (" + operation + "): " + message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
