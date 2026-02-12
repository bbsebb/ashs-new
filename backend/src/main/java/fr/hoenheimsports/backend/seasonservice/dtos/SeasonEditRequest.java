package fr.hoenheimsports.backend.seasonservice.dtos;

import fr.hoenheimsports.backend.seasonservice.validations.annotations.DateRange;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link fr.hoenheimsports.backend.seasonservice.entities.Season}
 */
@DateRange(startDate = "startDate", endDate = "endDate")
public record SeasonEditRequest(@NotNull  LocalDate startDate, @NotNull LocalDate endDate) implements Serializable {

}