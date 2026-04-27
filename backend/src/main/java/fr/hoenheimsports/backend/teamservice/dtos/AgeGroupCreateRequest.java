package fr.hoenheimsports.backend.teamservice.dtos;

import jakarta.validation.constraints.Min;

public record AgeGroupCreateRequest(
        @Min(value = 0, message = "La limite d'âge doit être positive")
        int ageLimit,
        boolean upperLimit) {
}
