package fr.hoenheimsports.backend.hallservice.mappers;

import fr.hoenheimsports.backend.hallservice.dtos.HallCreateRequest;
import fr.hoenheimsports.backend.hallservice.dtos.HallResponse;
import fr.hoenheimsports.backend.hallservice.entities.Hall;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

/**
 * Mapstruct mapper interface for converting between {@link Hall} entities and DTOs.
 */
@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface HallMapper {
    /**
     * Converts a {@link HallCreateRequest} DTO into a {@link Hall} entity.
     *
     * @param hallCreateRequest the creation request containing details of the hall
     * @return the mapped {@link Hall} entity
     */
    @Mapping(target = "address.street", source = "addressStreet")
    @Mapping(target = "address.city", source = "addressCity")
    @Mapping(target = "address.postalCode", source = "addressPostalCode")
    @Mapping(target = "address.country", source = "addressCountry")
    Hall toEntity(HallCreateRequest hallCreateRequest);

    /**
     * Converts a {@link Hall} entity into a {@link HallResponse} DTO.
     *
     * @param hall the {@link Hall} entity to map
     * @return the mapped {@link HallResponse} DTO
     */
    @Mapping(target = "addressStreet", source = "address.street")
    @Mapping(target = "addressCity", source = "address.city")
    @Mapping(target = "addressPostalCode", source = "address.postalCode")
    @Mapping(target = "addressCountry", source = "address.country")
    HallResponse toDto(Hall hall);

}