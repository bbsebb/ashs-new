package fr.hoenheimsports.backend.membershipservice.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;

/**
 * Value object representing a sports license number.
 */
@Embeddable
public record LicenseNumber(
    @NotBlank
    @Column(name = "license_number", nullable = false)
    String value
) {
}
