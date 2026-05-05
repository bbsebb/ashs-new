package fr.hoenheimsports.backend.membershipservice.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import org.jspecify.annotations.Nullable;

/**
 * Value object representing a SumUp checkout identifier.
 */
@Embeddable
public record SumUpCheckoutId(
    @Nullable
    @Column(name = "sumup_checkout_id")
    String value
) {
}
