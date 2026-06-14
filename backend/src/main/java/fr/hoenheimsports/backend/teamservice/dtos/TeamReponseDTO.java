package fr.hoenheimsports.backend.teamservice.dtos;

import fr.hoenheimsports.backend.teamservice.entities.Gender;
import org.jspecify.annotations.Nullable;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

/**
 * DTO response record for representing a team.
 *
 * @param id               the unique identifier of the team
 * @param seasonId         the unique identifier of the season
 * @param gender           the gender category of the team
 * @param name             the team's name details
 * @param photoFileName    the photo file name, if available
 * @param staffs           the list of assigned staff members
 * @param trainingSessions the list of scheduled training sessions
 */
public record TeamReponseDTO(UUID id, UUID seasonId, Gender gender, @Nullable TeamNameReponseDTO name,
                             @Nullable String photoFileName,
                             List<TeamStaffReponseDTO> staffs,
                             List<TrainingSessionResponseDTO> trainingSessions) implements Serializable {
}