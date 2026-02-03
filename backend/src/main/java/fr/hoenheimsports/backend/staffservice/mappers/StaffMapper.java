package fr.hoenheimsports.backend.staffservice.mappers;

import fr.hoenheimsports.backend.staffservice.dtos.StaffRequestDto;
import fr.hoenheimsports.backend.staffservice.entities.Staff;
import fr.hoenheimsports.backend.staffservice.dtos.StaffResponseDto;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface StaffMapper {
    @Mapping(source = "phone", target = "phone.phone")
    @Mapping(source = "email", target = "email.email")
    Staff toEntity(StaffRequestDto staffRequestDto);


    @Mapping(source = "phone.phone", target = "phone")
    @Mapping(source = "email.email", target = "email")
    StaffResponseDto toDto(Staff staff);



}