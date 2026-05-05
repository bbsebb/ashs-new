package fr.hoenheimsports.backend.membershipservice.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import org.jspecify.annotations.NullMarked;

/**
 * Value object representing a sports license number.
 */
@Embeddable
@NullMarked
public record LicenseNumber(
    @NotBlank
    @Column(name = "license_number", nullable = false)
    String value
) {
}
