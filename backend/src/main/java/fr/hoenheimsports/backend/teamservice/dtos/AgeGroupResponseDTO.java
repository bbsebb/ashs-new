package fr.hoenheimsports.backend.teamservice.dtos;

import java.util.UUID;

/**
 * DTO response record for representing an age group.
 *
 * @param id         the unique identifier of the age group
 * @param ageLimit   the limit age for this group
 * @param upperLimit flag indicating if the limit is an upper limit
 * @param name       the formulated name of the age group
 */
public record AgeGroupResponseDTO(
        UUID id,
        int ageLimit,
        boolean upperLimit,
        String name
) {
}
