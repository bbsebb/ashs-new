package fr.hoenheimsports.backend.teamservice.validations.validators;

import fr.hoenheimsports.backend.teamservice.dtos.TimeSlotDTO;
import fr.hoenheimsports.backend.teamservice.validations.annotations.ValidTimeSlot;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator implementation for {@link ValidTimeSlot} constraint.
 * Ensures the start time of a time slot is chronologically before the end time.
 */
public class TimeSlotValidator implements ConstraintValidator<ValidTimeSlot, TimeSlotDTO> {

    /**
     * Checks if the given {@link TimeSlotDTO} is valid.
     *
     * @param timeSlot the time slot to validate
     * @param context  the constraint validator context
     * @return true if the start time is before the end time, or if the slot/times are null
     */
    @Override
    public boolean isValid(TimeSlotDTO timeSlot, ConstraintValidatorContext context) {
        if (timeSlot == null || timeSlot.startTime() == null || timeSlot.endTime() == null) {
            return true;
        }
        return timeSlot.startTime().isBefore(timeSlot.endTime());
    }
}
