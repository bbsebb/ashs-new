package fr.hoenheimsports.backend.seasonservice.dtos;

import fr.hoenheimsports.backend.seasonservice.validations.annotations.DateRange;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * Data Transfer Object representing the request payload for updating an existing season.
 *
 * @param startDate the starting date of the season
 * @param endDate   the ending date of the season
 */
@DateRange(startDate = "startDate", endDate = "endDate")
public record SeasonUpdateRequest(@NotNull(message = "La date de début est obligatoire") LocalDate startDate,
                                  @NotNull(message = "La date de fin est obligatoire") LocalDate endDate) implements Serializable {

}