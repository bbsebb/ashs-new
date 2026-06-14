package fr.hoenheimsports.backend.teamservice.dtos;

/**
 * DTO response record representing a team's name components.
 *
 * @param teamNumber the number of the team
 * @param ageGroup   the associated age group details
 */
public record TeamNameReponseDTO(int teamNumber, AgeGroupResponseDTO ageGroup) {
}
