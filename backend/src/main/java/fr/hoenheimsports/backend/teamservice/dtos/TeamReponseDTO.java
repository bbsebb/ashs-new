package fr.hoenheimsports.backend.teamservice.dtos;

import fr.hoenheimsports.backend.teamservice.entities.Gender;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

/**
 * DTO for {@link fr.hoenheimsports.backend.teamservice.entities.Team}
 */
public record TeamReponseDTO(UUID id, UUID seasonId, Gender gender, TeamNameReponseDTO name,
                             List<TeamStaffReponseDTO> staffs,
                             List<TrainingSessionResponseDTO> trainingSessions) implements Serializable {
}