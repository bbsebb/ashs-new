package fr.hoenheimsports.backend.membershipservice.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import org.jspecify.annotations.Nullable;

/**
 * Value object representing detailed SumUp checkout information.
 *
 * @param id          the SumUp checkout reference
 * @param description description of the checkout
 * @param returnUrl   callback URL
 * @param date        date of checkout creation
 * @param checkoutUrl payment page URL
 */
@Embeddable
public record SumUpCheckout(
        @Column(name = "sumup_checkout_id", nullable = false)
        String id,

        @Column(name = "sumup_checkout_description")
        @Nullable
        String description,

        @Column(name = "sumup_checkout_return_url")
        @Nullable
        String returnUrl,

        @Column(name = "sumup_checkout_date")
        @Nullable
        String date,

        @Column(name = "sumup_checkout_url", nullable = false)
        String checkoutUrl
) {
}
