package fr.hoenheimsports.backend.hallservice.dtos;


import java.io.Serializable;
import java.util.UUID;

/**
 * DTO for {@link fr.hoenheimsports.backend.hallservice.entities.Hall}
 */
public record HallResponse(UUID id,
                           String name,
                           String addressStreet,
                           String addressCity,
                           String addressPostalCode,
                           String addressCountry) implements Serializable {
}