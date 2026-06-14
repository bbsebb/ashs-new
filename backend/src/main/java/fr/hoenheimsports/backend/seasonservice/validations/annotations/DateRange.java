package fr.hoenheimsports.backend.seasonservice.validations.annotations;

import fr.hoenheimsports.backend.seasonservice.validations.validators.DateRangeValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Constraint annotation for validating that a start date is before an end date within a class.
 */
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = DateRangeValidator.class)
@Documented
public @interface DateRange {
    /**
     * Default validation error message.
     *
     * @return the error message template
     */
    String message() default "La date de début doit être avant la date de fin";

    /**
     * Validation groups.
     *
     * @return the validation groups
     */
    Class<?>[] groups() default {};

    /**
     * Payload associated with the constraint.
     *
     * @return the payload class array
     */
    Class<? extends Payload>[] payload() default {};

    /**
     * The name of the field representing the start date.
     *
     * @return start date field name
     */
    String startDate();

    /**
     * The name of the field representing the end date.
     *
     * @return end date field name
     */
    String endDate();

    /**
     * Defines several {@link DateRange} annotations on the same element.
     */
    @Target({ ElementType.TYPE })
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @interface List {
        /**
         * The value representing the array of {@link DateRange} annotations.
         *
         * @return the DateRange annotations
         */
        DateRange[] value();
    }
}
