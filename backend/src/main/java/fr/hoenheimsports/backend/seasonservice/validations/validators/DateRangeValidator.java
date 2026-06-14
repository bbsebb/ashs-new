package fr.hoenheimsports.backend.seasonservice.validations.validators;

import fr.hoenheimsports.backend.seasonservice.validations.annotations.DateRange;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.BeanWrapperImpl;

import java.time.LocalDate;

/**
 * Validator class for the {@link DateRange} constraint annotation.
 * Validates that a start date field has a value chronologically before an end date field on a given object.
 */
public class DateRangeValidator implements ConstraintValidator<DateRange, Object> {
    /**
     * Name of the field representing the start date.
     */
    private String startDateFieldName;

    /**
     * Name of the field representing the end date.
     */
    private String endDateFieldName;

    /**
     * Initializes the validator in preparation for {@link #isValid(Object, ConstraintValidatorContext)} calls.
     *
     * @param constraintAnnotation annotation instance for a given constraint declaration
     */
    @Override
    public void initialize(DateRange constraintAnnotation) {
        this.startDateFieldName = constraintAnnotation.startDate();
        this.endDateFieldName = constraintAnnotation.endDate();
    }

    /**
     * Implements the validation logic.
     *
     * @param value   object to validate
     * @param context context in which the constraint is evaluated
     * @return true if start date is before end date or if either date is null, false otherwise
     */
    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        BeanWrapperImpl wrapper = new BeanWrapperImpl(value);
        var start = (LocalDate) wrapper.getPropertyValue(startDateFieldName);
        var end = (LocalDate) wrapper.getPropertyValue(endDateFieldName);

        if (start == null || end == null) {
            return true; // Let @NotNull handle it if the dates are mandatory
        }

        return start.isBefore(end);
    }
}
