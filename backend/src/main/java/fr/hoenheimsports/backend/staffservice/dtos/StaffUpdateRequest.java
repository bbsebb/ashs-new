package fr.hoenheimsports.backend.staffservice.dtos;

import fr.hoenheimsports.backend.staffservice.entities.Staff;
import org.jspecify.annotations.Nullable;

import java.io.Serializable;

/**
 * DTO for {@link Staff}
 */
public record StaffUpdateRequest(String firstName, String lastName, @Nullable String email,
                                 @Nullable String phone, @Nullable String avatarFileName) implements Serializable {
}