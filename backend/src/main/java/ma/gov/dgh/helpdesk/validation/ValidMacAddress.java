package ma.gov.dgh.helpdesk.validation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Custom validation annotation for MAC addresses
 */
@Documented
@Constraint(validatedBy = ValidMacAddress.MacAddressValidator.class)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidMacAddress {
    
    String message() default "Invalid MAC address format";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * Validator implementation
     */
    class MacAddressValidator implements ConstraintValidator<ValidMacAddress, String> {
        
        @Override
        public void initialize(ValidMacAddress constraintAnnotation) {
            // No initialization needed
        }
        
        @Override
        public boolean isValid(String value, ConstraintValidatorContext context) {
            if (value == null) {
                return true; // Let @NotNull handle null validation
            }
            return ValidationUtils.isValidMacAddress(value);
        }
    }
}
