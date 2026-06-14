package fr.hoenheimsports.backend.staffservice.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.jspecify.annotations.Nullable;

/**
 * DTO representing a request to create a new staff member.
 *
 * @param firstName the first name of the staff member, must not be blank
 * @param lastName  the last name of the staff member, must not be blank
 * @param email     the email address of the staff member, must be a valid email format or null
 * @param phone     the phone number of the staff member, must match the phone number format or null
 */
public record StaffCreateRequest(
        @NotBlank(message = "Le prénom est obligatoire")
        String firstName,

        @NotBlank(message = "Le nom est obligatoire")
        String lastName,

        @Email(message = "L'adresse e-mail est invalide")
        @Nullable
        String email,

        @Pattern(
                regexp = "^[0-9+()\\-\\s]{6,20}$",
                message = "Le numéro de téléphone est invalide"
        )
        @Nullable
        String phone) {
}
