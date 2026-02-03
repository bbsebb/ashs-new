package fr.hoenheimsports.backend.staffservice.dtos;

import fr.hoenheimsports.backend.staffservice.entities.Staff;

import java.io.Serializable;
import java.util.UUID;

/**
 * DTO for {@link Staff}
 */
public record StaffRequestDto(UUID id, String firstName, String lastName, String email,
                              String phone) implements Serializable {
}