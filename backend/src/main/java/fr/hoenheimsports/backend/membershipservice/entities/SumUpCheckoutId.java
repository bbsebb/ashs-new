package fr.hoenheimsports.backend.membershipservice.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/**
 * Value object representing a SumUp checkout identifier.
 */
@Embeddable
public record SumUpCheckoutId(
        @Column(name = "sumup_checkout_id", nullable = false)
    String value
) {
}
