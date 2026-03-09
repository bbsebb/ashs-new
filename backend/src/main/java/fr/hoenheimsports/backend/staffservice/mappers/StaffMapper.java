package fr.hoenheimsports.backend.staffservice.mappers;

import fr.hoenheimsports.backend.staffservice.dtos.StaffCreateRequest;
import fr.hoenheimsports.backend.staffservice.dtos.StaffResponseDto;
import fr.hoenheimsports.backend.staffservice.dtos.StaffUpdateRequest;
import fr.hoenheimsports.backend.staffservice.entities.Staff;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface StaffMapper {
    @Mapping(source = "phone", target = "phone.phone")
    @Mapping(source = "email", target = "email.email")
    Staff toEntity(StaffUpdateRequest staffUpdateRequest);

    @Mapping(source = "phone", target = "phone.phone")
    @Mapping(source = "email", target = "email.email")
    Staff toEntity(StaffCreateRequest staffCreateRequest);


    @Mapping(source = "phone.phone", target = "phone")
    @Mapping(source = "email.email", target = "email")
    StaffResponseDto toDto(Staff staff);


}