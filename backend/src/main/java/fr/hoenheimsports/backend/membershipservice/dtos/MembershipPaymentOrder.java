package fr.hoenheimsports.backend.membershipservice.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * DTO representing an order to pay for one or more memberships in a campaign.
 *
 * @param campaignId                    the campaign identifier
 * @param paymentPayerInfoCreateRequest details of the payer
 * @param membershipCreateRequests      list of memberships to create and pay for
 * @param hasDiscount                   flag indicating if family/multiple membership discount applies
 */
public record MembershipPaymentOrder(
        @NotNull(message = "La campagne est obligatoire")
        UUID campaignId,
        @Valid
        PaymentPayerInfoCreateRequest paymentPayerInfoCreateRequest,
        @Valid
        List<MembershipCreateRequest> membershipCreateRequests,
        boolean hasDiscount) {

}
