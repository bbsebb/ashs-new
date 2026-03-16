package fr.hoenheimsports.backend.teamservice.dtos;

import jakarta.validation.constraints.Min;

public record AgeGroupUpdateRequest(
        @Min(0)
        int ageLimit,
        boolean upperLimit) {
}
