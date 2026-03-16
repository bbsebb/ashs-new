package fr.hoenheimsports.backend.teamservice.mappers;

import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupResponseDTO;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupCreateRequest;
import fr.hoenheimsports.backend.teamservice.entities.AgeGroup;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface AgeGroupMapper {
    AgeGroup toEntity(AgeGroupCreateRequest ageGroupCreateRequest);

    @Mapping(target = "name", expression = "java(namingAgeGroup(ageGroup.getAgeLimit(), ageGroup.isUpperLimit()))")
    AgeGroupResponseDTO toDto(AgeGroup ageGroup);


    default String namingAgeGroup(int ageLimit, boolean isUpperLimite) {
        return isUpperLimite ? "-%s ans".formatted(ageLimit) : "Sénior";
    }

}