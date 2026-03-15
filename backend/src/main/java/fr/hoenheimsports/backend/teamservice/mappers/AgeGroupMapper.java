package fr.hoenheimsports.backend.teamservice.mappers;

import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupResponseDTO;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupeCreateRequest;
import fr.hoenheimsports.backend.teamservice.entities.AgeGroup;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface AgeGroupMapper {
    AgeGroup toEntity(AgeGroupeCreateRequest ageGroupeCreateRequest);

    @Mapping(target = "name", expression = "java(namingAgeGroup(ageGroup.getAgeLimit(), ageGroup.isUpperLimit()))")
    AgeGroupResponseDTO toDto(AgeGroup ageGroup);


    default String namingAgeGroup(int ageLimit, boolean isUpperLimite) {
        return isUpperLimite ? "-%s ans".formatted(ageLimit) : "Sénior";
    }

}