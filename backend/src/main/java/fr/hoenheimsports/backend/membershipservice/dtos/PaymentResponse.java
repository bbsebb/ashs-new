package fr.hoenheimsports.backend.membershipservice.dtos;

import fr.hoenheimsports.backend.membershipservice.entities.MembershipStatus;
import org.jspecify.annotations.Nullable;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * DTO representing detailed information about a payment transaction.
 *
 * @param id           the transaction ID
 * @param campaignId   the campaign ID
 * @param amount       the total transaction amount
 * @param payerInfo    the payer info
 * @param status       the current membership payment status
 * @param checkoutDate the checkout date
 * @param isDiscounted flag indicating if a discount was applied
 * @param memberships  the list of memberships paid in this transaction
 */
public record PaymentResponse(
        UUID id,
        UUID campaignId,
        BigDecimal amount,
        PaymentPayerResponse payerInfo,
        MembershipStatus status,
        @Nullable
        String checkoutDate,
        boolean isDiscounted,
        List<MembershipResponse> memberships
) {
}
