package ma.gov.dgh.helpdesk.validation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Custom validation annotation for IP addresses
 */
@Documented
@Constraint(validatedBy = ValidIpAddress.IpAddressValidator.class)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidIpAddress {
    
    String message() default "Invalid IP address format";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * Validator implementation
     */
    class IpAddressValidator implements ConstraintValidator<ValidIpAddress, String> {
        
        @Override
        public void initialize(ValidIpAddress constraintAnnotation) {
            // No initialization needed
        }
        
        @Override
        public boolean isValid(String value, ConstraintValidatorContext context) {
            if (value == null) {
                return true; // Let @NotNull handle null validation
            }
            return ValidationUtils.isValidIpAddress(value);
        }
    }
}
