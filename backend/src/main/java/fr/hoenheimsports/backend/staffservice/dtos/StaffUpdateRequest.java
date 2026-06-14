package fr.hoenheimsports.backend.staffservice.dtos;

import org.jspecify.annotations.Nullable;

import java.io.Serializable;

/**
 * DTO representing a request to update an existing staff member's details.
 *
 * @param firstName      the new first name of the staff member
 * @param lastName       the new last name of the staff member
 * @param email          the new email address of the staff member or null
 * @param phone          the new phone number of the staff member or null
 * @param avatarFileName the new name of the avatar image file or null
 */
public record StaffUpdateRequest(String firstName, String lastName, @Nullable String email,
                                 @Nullable String phone, @Nullable String avatarFileName) implements Serializable {
}