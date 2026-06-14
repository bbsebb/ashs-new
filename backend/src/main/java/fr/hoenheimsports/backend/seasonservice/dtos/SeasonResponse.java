package fr.hoenheimsports.backend.seasonservice.dtos;

import lombok.extern.slf4j.Slf4j;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Data Transfer Object representing the response details of a season.
 *
 * @param id        the unique identifier of the season
 * @param startDate the start date of the season
 * @param endDate   the end date of the season
 * @param name      the display name of the season
 * @param isCurrent indicates if the season is currently active
 */
@Slf4j
public record SeasonResponse(UUID id, LocalDate startDate, LocalDate endDate, String name, boolean isCurrent) implements Serializable {
    /**
     * Compact constructor that initializes and calculates the current status of the season.
     *
     * @param id        the unique identifier of the season
     * @param startDate the start date of the season
     * @param endDate   the end date of the season
     * @param name      the display name of the season
     * @param isCurrent indicates if the season is currently active
     */
    public SeasonResponse {
        isCurrent = isCurrent(startDate, endDate);
    }

    /**
     * Internal helper to determine if the given date range spans the current date.
     *
     * @param startDate the start date to check
     * @param endDate   the end date to check
     * @return true if the current date falls within the range, false otherwise
     */
    private boolean isCurrent(LocalDate startDate, LocalDate endDate) {
        return startDate.isBefore(LocalDate.now()) && endDate.isAfter(LocalDate.now());
    }
}