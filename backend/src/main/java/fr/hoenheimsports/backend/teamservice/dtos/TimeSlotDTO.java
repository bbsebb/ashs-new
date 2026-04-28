package fr.hoenheimsports.backend.teamservice.dtos;

import fr.hoenheimsports.backend.teamservice.validations.annotations.ValidTimeSlot;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.time.LocalTime;

/**
 * DTO for {@link fr.hoenheimsports.backend.teamservice.entities.TimeSlot}
 */
@ValidTimeSlot
public record TimeSlotDTO(@NotNull(message = "L'heure de début est obligatoire") LocalTime startTime, @NotNull(message = "L'heure de fin est obligatoire") LocalTime endTime) implements Serializable {

}