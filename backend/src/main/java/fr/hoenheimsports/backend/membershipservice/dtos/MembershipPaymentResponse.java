package fr.hoenheimsports.backend.membershipservice.dtos;

import java.util.List;
import java.util.UUID;

/**
 * Response containing membership ID and checkout URL for payment.
 *
 * @param paymentTransactionId the unique identifier of the payment transaction
 * @param sumupCheckout        the SumUp checkout details
 * @param memberships          the list of memberships in this transaction
 */
public record MembershipPaymentResponse(
        UUID paymentTransactionId,
        SumUpCheckoutDto sumupCheckout,
        List<MembershipResponse> memberships
) {
}
