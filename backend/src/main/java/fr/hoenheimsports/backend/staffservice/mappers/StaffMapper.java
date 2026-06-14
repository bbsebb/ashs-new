package fr.hoenheimsports.backend.staffservice.mappers;

import fr.hoenheimsports.backend.staffservice.dtos.StaffCreateRequest;
import fr.hoenheimsports.backend.staffservice.dtos.StaffResponseDto;
import fr.hoenheimsports.backend.staffservice.dtos.StaffUpdateRequest;
import fr.hoenheimsports.backend.staffservice.entities.Staff;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper interface using MapStruct to map between Staff entities and DTOs.
 */
@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface StaffMapper {
    /**
     * Maps a StaffUpdateRequest DTO to a Staff entity.
     *
     * @param staffUpdateRequest the DTO containing update information
     * @return the mapped {@link Staff} entity
     */
    @Mapping(source = "phone", target = "phone.phone")
    @Mapping(source = "email", target = "email.email")
    Staff toEntity(StaffUpdateRequest staffUpdateRequest);

    /**
     * Maps a StaffCreateRequest DTO to a Staff entity.
     *
     * @param staffCreateRequest the DTO containing creation information
     * @return the mapped {@link Staff} entity
     */
    @Mapping(source = "phone", target = "phone.phone")
    @Mapping(source = "email", target = "email.email")
    Staff toEntity(StaffCreateRequest staffCreateRequest);


    /**
     * Maps a Staff entity to a StaffResponseDto.
     *
     * @param staff the Staff entity
     * @return the mapped {@link StaffResponseDto}
     */
    @Mapping(source = "phone.phone", target = "phone")
    @Mapping(source = "email.email", target = "email")
    StaffResponseDto toDto(Staff staff);


}