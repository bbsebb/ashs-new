package fr.hoenheimsports.backend.seasonservice.dtos;

import fr.hoenheimsports.backend.seasonservice.validations.annotations.DateRange;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link fr.hoenheimsports.backend.seasonservice.entities.Season}
 */
@DateRange(startDate = "startDate", endDate = "endDate")
public record SeasonUpdateRequest(@NotNull(message = "La date de début est obligatoire") LocalDate startDate,
                                  @NotNull(message = "La date de fin est obligatoire") LocalDate endDate) implements Serializable {

}