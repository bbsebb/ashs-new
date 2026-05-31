package fr.hoenheimsports.backend.membershipservice.dtos;

import org.jspecify.annotations.Nullable;

/**
 * DTO exposing SumUp checkout details.
 */
public record SumUpCheckoutDto(
        String id,
        @Nullable String description,
        @Nullable String returnUrl,
        @Nullable String date,
        String checkoutUrl
) {
}
