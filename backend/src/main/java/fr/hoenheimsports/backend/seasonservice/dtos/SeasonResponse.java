package fr.hoenheimsports.backend.seasonservice.dtos;

import lombok.extern.slf4j.Slf4j;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for {@link fr.hoenheimsports.backend.seasonservice.entities.Season}
 */
@Slf4j

public record SeasonResponse(UUID id, LocalDate startDate, LocalDate endDate, String name, boolean isCurrent) implements Serializable {
    public SeasonResponse {
        isCurrent = isCurrent(startDate, endDate);
    }

    private boolean isCurrent(LocalDate startDate, LocalDate endDate) {
        return startDate.isBefore(LocalDate.now()) && endDate.isAfter(LocalDate.now());
    }
}