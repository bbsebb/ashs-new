package fr.hoenheimsports.backend.teamservice.dtos;

import fr.hoenheimsports.backend.teamservice.entities.Role;

import java.io.Serializable;
import java.util.UUID;

/**
 * DTO response record for representing a team staff member.
 *
 * @param id      the unique identifier of the team staff association
 * @param role    the role of the staff member
 * @param staffId the unique identifier of the staff member
 */
public record TeamStaffReponseDTO(UUID id, Role role, UUID staffId) implements Serializable {
}