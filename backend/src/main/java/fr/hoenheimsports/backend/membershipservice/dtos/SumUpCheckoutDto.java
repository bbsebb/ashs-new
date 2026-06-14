package fr.hoenheimsports.backend.membershipservice.dtos;

import org.jspecify.annotations.Nullable;

/**
 * DTO exposing SumUp checkout details.
 *
 * @param id          the SumUp checkout reference ID
 * @param description the description of the payment
 * @param returnUrl   the return URL on payment completion
 * @param date        the checkout date
 * @param checkoutUrl the hosted payment page URL
 */
public record SumUpCheckoutDto(
        String id,
        @Nullable String description,
        @Nullable String returnUrl,
        @Nullable String date,
        String checkoutUrl
) {
}
