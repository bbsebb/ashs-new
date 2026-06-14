package fr.hoenheimsports.backend.teamservice.dtos;

import jakarta.validation.constraints.Min;

/**
 * DTO request record for creating a new age group.
 *
 * @param ageLimit   the limit age for this group
 * @param upperLimit flag indicating if the limit is an upper limit (e.g., -18) or a lower limit (e.g., +18)
 */
public record AgeGroupCreateRequest(
        @Min(value = 0, message = "La limite d'âge doit être positive")
        int ageLimit,
        boolean upperLimit) {
}
