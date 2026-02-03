package fr.hoenheimsports.backend.hallservice.mappers;

import fr.hoenheimsports.backend.hallservice.dtos.HallCreateRequest;
import fr.hoenheimsports.backend.hallservice.dtos.HallResponse;
import fr.hoenheimsports.backend.hallservice.entities.Hall;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface HallMapper {
    @Mapping(target = "address.street", source = "addressStreet")
    @Mapping(target = "address.city", source = "addressCity")
    @Mapping(target = "address.postalCode", source = "addressPostalCode")
    @Mapping(target = "address.country", source = "addressCountry")
    Hall toEntity(HallCreateRequest HallCreateRequest);

    @Mapping(target = "addressStreet", source = "address.street")
    @Mapping(target = "addressCity", source = "address.city")
    @Mapping(target = "addressPostalCode", source = "address.postalCode")
    @Mapping(target = "addressCountry", source = "address.country")
    HallResponse toDto(Hall hall);

}