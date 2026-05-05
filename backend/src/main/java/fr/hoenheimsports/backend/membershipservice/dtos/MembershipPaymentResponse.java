package fr.hoenheimsports.backend.membershipservice.dtos;

import java.util.UUID;

/**
 * Response containing membership ID and checkout URL for payment.
 */
public record MembershipPaymentResponse(
    UUID membershipId,
    String checkoutUrl
) {
}
