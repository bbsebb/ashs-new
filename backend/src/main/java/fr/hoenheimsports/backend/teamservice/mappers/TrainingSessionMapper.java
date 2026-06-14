package fr.hoenheimsports.backend.teamservice.mappers;

import fr.hoenheimsports.backend.teamservice.dtos.TrainingSessionResponseDTO;
import fr.hoenheimsports.backend.teamservice.entities.TrainingSession;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper interface for converting between {@link TrainingSession} entities and DTOs.
 */
@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface TrainingSessionMapper {

    /**
     * Converts a {@link TrainingSession} entity to a {@link TrainingSessionResponseDTO}.
     *
     * @param trainingSession the training session entity
     * @return the mapped response DTO
     */
    @Mapping(source = "team.id", target = "teamId")
    TrainingSessionResponseDTO toDto(TrainingSession trainingSession);
}