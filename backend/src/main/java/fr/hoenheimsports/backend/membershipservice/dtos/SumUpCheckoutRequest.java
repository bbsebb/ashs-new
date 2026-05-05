package fr.hoenheimsports.backend.membershipservice.dtos;

import java.math.BigDecimal;

/**
 * DTO for creating a SumUp checkout.
 */
public record SumUpCheckoutRequest(
    String checkout_reference,
    BigDecimal amount,
    String currency,
    String pay_to_email,
    String description,
    String return_url
) {
}
