package fr.hoenheimsports.backend.teamservice.validations.annotations;

import fr.hoenheimsports.backend.teamservice.validations.validators.TimeSlotValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validation annotation to verify that a time slot is valid (start time before end time).
 */
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = TimeSlotValidator.class)
@Documented
public @interface ValidTimeSlot {
    /**
     * Default error message when validation fails.
     *
     * @return the error message
     */
    String message() default "L'heure de début doit être avant l'heure de fin";

    /**
     * Default groups.
     *
     * @return the validation groups
     */
    Class<?>[] groups() default {};

    /**
     * Default payload.
     *
     * @return the validation payload
     */
    Class<? extends Payload>[] payload() default {};
}
