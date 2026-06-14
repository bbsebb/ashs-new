package fr.hoenheimsports.backend.teamservice.entities;

import fr.hoenheimsports.backend.teamservice.exceptions.InvalidTimeSlotException;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

/**
 * JPA Embeddable record representing a time slot with start and end times.
 *
 * @param startTime the start time of the time slot
 * @param endTime   the end time of the time slot
 */
@Embeddable
public record TimeSlot(
        @NotNull
        LocalTime startTime,
        @NotNull
        LocalTime endTime
) {
    /**
     * Compact constructor for TimeSlot.
     * Validates that the start time is strictly before the end time.
     *
     * @throws InvalidTimeSlotException if the start time is not before the end time
     */
    public TimeSlot {
        if (!startTime.isBefore(endTime)) {
            throw new InvalidTimeSlotException("L'heure de début doit être avant l'heure de fin");
        }
    }
}
