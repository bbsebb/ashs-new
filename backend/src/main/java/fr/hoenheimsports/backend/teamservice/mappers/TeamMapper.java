package fr.hoenheimsports.backend.teamservice.mappers;

import fr.hoenheimsports.backend.teamservice.dtos.TeamCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.TeamReponseDTO;
import fr.hoenheimsports.backend.teamservice.entities.Team;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING,
        uses = {TrainingSessionMapper.class, AgeGroupMapper.class, TeamNameMapper.class},
        collectionMappingStrategy = CollectionMappingStrategy.ADDER_PREFERRED
)
public interface TeamMapper {


    TeamReponseDTO toDto(Team team);


    @Mapping(source = "teamNumber", target = "name.teamNumber")
    Team toEntity(TeamCreateRequest teamCreateRequest);
}