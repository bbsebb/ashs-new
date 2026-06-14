package fr.hoenheimsports.backend.teamservice.mappers;

import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupResponseDTO;
import fr.hoenheimsports.backend.teamservice.entities.AgeGroup;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper interface for converting between {@link AgeGroup} entities and DTOs.
 */
@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface AgeGroupMapper {
    /**
     * Converts an {@link AgeGroupCreateRequest} to an {@link AgeGroup} entity.
     *
     * @param ageGroupCreateRequest the creation request DTO
     * @return the mapped entity
     */
    AgeGroup toEntity(AgeGroupCreateRequest ageGroupCreateRequest);

    /**
     * Converts an {@link AgeGroup} entity to an {@link AgeGroupResponseDTO}.
     *
     * @param ageGroup the age group entity
     * @return the mapped response DTO
     */
    @Mapping(target = "name", expression = "java(namingAgeGroup(ageGroup.getAgeLimit(), ageGroup.isUpperLimit()))")
    AgeGroupResponseDTO toDto(AgeGroup ageGroup);

    /**
     * Helper method to generate a user-friendly name for the age group.
     *
     * @param ageLimit      the age limit
     * @param isUpperLimite flag indicating if it's an upper or lower limit
     * @return a formatted string representing the age group name
     */
    default String namingAgeGroup(int ageLimit, boolean isUpperLimite) {
        var sign = isUpperLimite ? "-" : "+";
        return "%s%s ans".formatted(sign, ageLimit);
    }
}