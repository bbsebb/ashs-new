package fr.hoenheimsports.backend.teamservice.dtos;

import fr.hoenheimsports.backend.teamservice.entities.TrainingSession;

import java.io.Serializable;
import java.time.DayOfWeek;
import java.util.UUID;

/**
 * DTO for {@link TrainingSession}
 */
public record TrainingSessionResponseDTO(UUID id, UUID hallId, DayOfWeek dayOfWeek, TimeSlotDTO timeSlot,
                                         UUID teamId) implements Serializable {
}