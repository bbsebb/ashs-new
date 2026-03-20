package fr.hoenheimsports.backend.teamservice.dtos;

import fr.hoenheimsports.backend.teamservice.entities.Role;

import java.io.Serializable;
import java.util.UUID;

/**
 * DTO for {@link fr.hoenheimsports.backend.teamservice.entities.TeamStaff}
 */
public record TeamStaffReponseDTO(UUID id, Role role, UUID staffId) implements Serializable {
}