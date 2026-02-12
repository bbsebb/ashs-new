package fr.hoenheimsports.backend.seasonservice.mappers;

import fr.hoenheimsports.backend.seasonservice.dtos.SeasonCreateRequest;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonResponse;
import fr.hoenheimsports.backend.seasonservice.entities.Season;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface SeasonMapper {
    Season toEntity(SeasonCreateRequest seasonResponse);

    SeasonResponse toDto(Season season);


}