package fr.hoenheimsports.backend.teamservice.mappers;

import fr.hoenheimsports.backend.teamservice.dtos.TrainingSessionResponseDTO;
import fr.hoenheimsports.backend.teamservice.entities.TrainingSession;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface TrainingSessionMapper {

    @Mapping(source = "team.id", target = "teamId")
    TrainingSessionResponseDTO toDto(TrainingSession trainingSession);


}