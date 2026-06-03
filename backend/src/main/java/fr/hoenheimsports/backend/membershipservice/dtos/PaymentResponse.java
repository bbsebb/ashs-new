package fr.hoenheimsports.backend.membershipservice.dtos;

import fr.hoenheimsports.backend.membershipservice.entities.MembershipStatus;
import org.jspecify.annotations.Nullable;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * DTO representing detailed information about a payment transaction.
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
