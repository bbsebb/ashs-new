package fr.hoenheimsports.backend.teamservice.mappers;

import fr.hoenheimsports.backend.teamservice.dtos.TeamNameReponseDTO;
import fr.hoenheimsports.backend.teamservice.entities.TeamName;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper interface for converting between {@link TeamName} entities and DTOs.
 */
@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING,
        uses = {AgeGroupMapper.class})
public interface TeamNameMapper {

    /**
     * Converts a {@link TeamName} entity to a {@link TeamNameReponseDTO}.
     *
     * @param teamName the team name entity
     * @return the mapped response DTO
     */
    TeamNameReponseDTO toDto(TeamName teamName);
}