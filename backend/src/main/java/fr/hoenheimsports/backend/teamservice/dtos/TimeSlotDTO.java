package fr.hoenheimsports.backend.teamservice.dtos;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.time.LocalTime;

/**
 * DTO for {@link fr.hoenheimsports.backend.teamservice.entities.TimeSlot}
 */
public record TimeSlotDTO(@NotNull LocalTime startTime, @NotNull LocalTime endTime) implements Serializable {

}