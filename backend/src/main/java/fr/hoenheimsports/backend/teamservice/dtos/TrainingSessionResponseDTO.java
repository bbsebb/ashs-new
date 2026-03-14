package fr.hoenheimsports.backend.teamservice.dtos;

import fr.hoenheimsports.backend.teamservice.entities.TrainingSession;

import java.io.Serializable;
import java.util.UUID;

/**
 * DTO for {@link TrainingSession}
 */
public record TrainingSessionResponseDTO(UUID id, UUID hallId, TimeSlotResponseDTO timeSlot,
                                         UUID teamId) implements Serializable {
}