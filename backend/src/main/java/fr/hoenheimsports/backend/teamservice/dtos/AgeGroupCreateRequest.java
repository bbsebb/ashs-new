package fr.hoenheimsports.backend.teamservice.dtos;

import jakarta.validation.constraints.Min;

public record AgeGroupCreateRequest(
        @Min(0)
        int ageLimit,
        boolean upperLimit) {
}
