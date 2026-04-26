package fr.hoenheimsports.backend.staffservice.entities;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Pattern;
import org.jspecify.annotations.Nullable;

/**
 * Value object representing a phone number.
 *
 * @param phone the string representation of the phone number
 */
@Embeddable
public record Phone(
        @Pattern(
                regexp = "^[0-9+()\\-\\s]{6,20}$",
                message = "Le numéro de téléphone est invalide")
        @Nullable
        String phone
) {
}
