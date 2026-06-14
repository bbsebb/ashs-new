package fr.hoenheimsports.backend.teamservice.dtos;

import jakarta.validation.constraints.Min;

/**
 * DTO request record for updating an age group.
 *
 * @param ageLimit   the limit age for this group
 * @param upperLimit flag indicating if the limit is an upper limit
 */
public record AgeGroupUpdateRequest(
        @Min(value = 0, message = "La limite d'âge doit être positive")
        int ageLimit,
        boolean upperLimit) {
}
