package fr.hoenheimsports.backend.seasonservice.mappers;

import fr.hoenheimsports.backend.seasonservice.dtos.SeasonCreateRequest;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonResponse;
import fr.hoenheimsports.backend.seasonservice.entities.Season;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

/**
 * Mapstruct mapper interface for converting between {@link Season} entities and DTOs.
 */
@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface SeasonMapper {
    /**
     * Converts a {@link SeasonCreateRequest} DTO into a {@link Season} entity.
     *
     * @param seasonCreateRequest the creation request containing start and end dates
     * @return the mapped {@link Season} entity
     */
    Season toEntity(SeasonCreateRequest seasonCreateRequest);

    /**
     * Converts a {@link Season} entity into a {@link SeasonResponse} DTO.
     *
     * @param season the {@link Season} entity to map
     * @return the mapped {@link SeasonResponse} DTO
     */
    SeasonResponse toDto(Season season);

}