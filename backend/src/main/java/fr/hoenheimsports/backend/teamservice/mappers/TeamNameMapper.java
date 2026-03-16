package fr.hoenheimsports.backend.teamservice.mappers;

import fr.hoenheimsports.backend.teamservice.dtos.TeamNameReponseDTO;
import fr.hoenheimsports.backend.teamservice.entities.TeamName;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING,
        uses = {AgeGroupMapper.class})
public interface TeamNameMapper {


    TeamNameReponseDTO toDto(TeamName teamName);

}