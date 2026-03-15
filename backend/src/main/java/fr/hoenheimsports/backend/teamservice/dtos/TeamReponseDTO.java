package fr.hoenheimsports.backend.teamservice.dtos;

import fr.hoenheimsports.backend.teamservice.entities.Gender;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

/**
 * DTO for {@link fr.hoenheimsports.backend.teamservice.entities.Team}
 */
public record TeamReponseDTO(UUID id, @NotNull UUID seasonId, @NotNull Gender gender, int nameTeamNumber,
                             UUID nameAgeGroupId, int nameAgeGroupAgeLimit, boolean nameAgeGroupIsUpperLimit,
                             List<TeamStaffReponseDTO> staffs,
                             List<TrainingSessionResponseDTO> trainingSessions) implements Serializable {
}