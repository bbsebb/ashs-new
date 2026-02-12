package fr.hoenheimsports.backend.seasonservice.validations.annotations;

import fr.hoenheimsports.backend.seasonservice.validations.validators.DateRangeValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ ElementType.TYPE }) // C'est ici que la magie opère pour viser le DTO entier
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = DateRangeValidator.class) // On lie l'annotation au validateur
@Documented
public @interface DateRange {
    String message() default "La date de début doit être avant la date de fin";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

    String startDate(); // Nom du premier champ
    String endDate(); // Nom du second champ

    @Target({ ElementType.TYPE })
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @interface List {
        DateRange[] value();
    }
}
