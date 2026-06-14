package fr.hoenheimsports.backend.staffservice.dtos;

import org.jspecify.annotations.Nullable;

import java.io.Serializable;
import java.util.UUID;

/**
 * DTO representing a response containing staff member details.
 *
 * @param id             the unique identifier of the staff member
 * @param firstName      the first name of the staff member
 * @param lastName       the last name of the staff member
 * @param email          the email address of the staff member or null
 * @param phone          the phone number of the staff member or null
 * @param avatarFileName the name of the avatar image file or null
 */
public record StaffResponseDto(UUID id, String firstName, String lastName,@Nullable String email,
                               @Nullable String phone,@Nullable String avatarFileName) implements Serializable {
}