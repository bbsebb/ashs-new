package fr.hoenheimsports.backend.membershipservice.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/**
 * Value object representing a SumUp checkout identifier.
 */
@Embeddable
public record SumUpCheckoutUrl(
        @Column(name = "sumup_checkout_url", nullable = false)
    String value
) {
}
