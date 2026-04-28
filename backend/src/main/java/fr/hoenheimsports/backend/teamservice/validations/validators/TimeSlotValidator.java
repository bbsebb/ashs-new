package fr.hoenheimsports.backend.teamservice.validations.validators;

import fr.hoenheimsports.backend.teamservice.dtos.TimeSlotDTO;
import fr.hoenheimsports.backend.teamservice.validations.annotations.ValidTimeSlot;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class TimeSlotValidator implements ConstraintValidator<ValidTimeSlot, TimeSlotDTO> {

    @Override
    public boolean isValid(TimeSlotDTO timeSlot, ConstraintValidatorContext context) {
        if (timeSlot == null || timeSlot.startTime() == null || timeSlot.endTime() == null) {
            return true;
        }
        return timeSlot.startTime().isBefore(timeSlot.endTime());
    }
}
