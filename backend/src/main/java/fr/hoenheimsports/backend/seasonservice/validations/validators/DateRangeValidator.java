package fr.hoenheimsports.backend.seasonservice.validations.validators;

import fr.hoenheimsports.backend.seasonservice.validations.annotations.DateRange;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.BeanWrapperImpl;

import java.time.LocalDate;

public class DateRangeValidator implements ConstraintValidator<DateRange, Object> {
    private String startDateFieldName;
    private String endDateFieldName;
    @Override
    public void initialize(DateRange constraintAnnotation) {
        this.startDateFieldName = constraintAnnotation.startDate();
        this.endDateFieldName = constraintAnnotation.endDate();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        BeanWrapperImpl wrapper = new BeanWrapperImpl(value);
        var start = (LocalDate) wrapper.getPropertyValue(startDateFieldName);
        var end = (LocalDate) wrapper.getPropertyValue(endDateFieldName);

        if (start == null || end == null) {
            return true; // On laisse @NotNull gérer le cas si les dates sont obligatoires
        }

        return start.isBefore(end);
    }
}
