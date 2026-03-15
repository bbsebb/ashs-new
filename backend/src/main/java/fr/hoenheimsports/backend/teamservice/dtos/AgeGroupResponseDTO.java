package fr.hoenheimsports.backend.teamservice.dtos;

import java.util.UUID;

public record AgeGroupResponseDTO(
        UUID id,
        int ageLimit,
        boolean upperLimit,
        String name
) {
}
