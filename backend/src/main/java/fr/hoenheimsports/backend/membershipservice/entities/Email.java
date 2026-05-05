package fr.hoenheimsports.backend.membershipservice.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import org.jspecify.annotations.NullMarked;

/**
 * Value object representing an email address for a membership.
 */
@Embeddable
@NullMarked
public record Email(
    @jakarta.validation.constraints.Email
    @NotBlank
    @Column(name = "email", nullable = false)
    String value
) {
}
