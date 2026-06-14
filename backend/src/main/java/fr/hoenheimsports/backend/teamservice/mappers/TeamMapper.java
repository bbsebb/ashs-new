package fr.hoenheimsports.backend.teamservice.mappers;

import fr.hoenheimsports.backend.teamservice.dtos.TeamCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.TeamReponseDTO;
import fr.hoenheimsports.backend.teamservice.entities.Team;
import org.mapstruct.*;

/**
 * Mapper interface for converting between {@link Team} entities and DTOs.
 */
@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING,
        uses = {TrainingSessionMapper.class, AgeGroupMapper.class, TeamNameMapper.class},
        collectionMappingStrategy = CollectionMappingStrategy.ADDER_PREFERRED
)
public interface TeamMapper {

    /**
     * Converts a {@link Team} entity to a {@link TeamReponseDTO}.
     *
     * @param team the team entity
     * @return the mapped response DTO
     */
    TeamReponseDTO toDto(Team team);

    /**
     * Converts a {@link TeamCreateRequest} DTO to a {@link Team} entity.
     *
     * @param teamCreateRequest the team creation request DTO
     * @return the mapped entity
     */
    @Mapping(source = "teamNumber", target = "name.teamNumber")
    Team toEntity(TeamCreateRequest teamCreateRequest);
}