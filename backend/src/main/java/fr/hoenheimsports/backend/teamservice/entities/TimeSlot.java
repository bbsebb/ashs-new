package fr.hoenheimsports.backend.teamservice.entities;

import fr.hoenheimsports.backend.teamservice.exceptions.InvalidTimeSlotException;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

@Embeddable
public record TimeSlot(
        @NotNull
        LocalTime startTime,
        @NotNull
        LocalTime endTime
) {
    public TimeSlot {
        if (!startTime.isBefore(endTime)) {
            throw new InvalidTimeSlotException("L'heure de début doit être avant l'heure de fin");
        }
    }
}
