package fr.hoenheimsports.backend.hallservice.dtos;


import java.io.Serializable;
import java.util.UUID;

/**
 * Data Transfer Object representing the response details of a hall.
 *
 * @param id                the unique identifier of the hall
 * @param name              the name of the hall
 * @param addressStreet     the street component of the hall's address
 * @param addressCity       the city component of the hall's address
 * @param addressPostalCode the postal code component of the hall's address
 * @param addressCountry    the country component of the hall's address
 */
public record HallResponse(UUID id,
                           String name,
                           String addressStreet,
                           String addressCity,
                           String addressPostalCode,
                           String addressCountry) implements Serializable {
}