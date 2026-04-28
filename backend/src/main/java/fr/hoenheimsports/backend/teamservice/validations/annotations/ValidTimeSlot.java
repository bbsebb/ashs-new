package fr.hoenheimsports.backend.teamservice.validations.annotations;

import fr.hoenheimsports.backend.teamservice.validations.validators.TimeSlotValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = TimeSlotValidator.class)
@Documented
public @interface ValidTimeSlot {
    String message() default "L'heure de début doit être avant l'heure de fin";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
