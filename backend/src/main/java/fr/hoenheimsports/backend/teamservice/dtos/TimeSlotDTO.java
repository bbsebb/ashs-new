package fr.hoenheimsports.backend.teamservice.dtos;

import java.io.Serializable;
import java.time.LocalTime;

/**
 * DTO for {@link fr.hoenheimsports.backend.teamservice.entities.TimeSlot}
 */
public record TimeSlotDTO(LocalTime startTime, LocalTime endTime) implements Serializable {

}