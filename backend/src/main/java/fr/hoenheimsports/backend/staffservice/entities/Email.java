package fr.hoenheimsports.backend.staffservice.entities;

import jakarta.persistence.Embeddable;
import org.jspecify.annotations.Nullable;

/**
 * Value object representing an email address.
 *
 * @param email the string representation of the email address
 */
@Embeddable
public record Email(@jakarta.validation.constraints.Email @Nullable String email) {
}
