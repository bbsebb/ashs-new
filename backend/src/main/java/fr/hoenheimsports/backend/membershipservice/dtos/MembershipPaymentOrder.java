package fr.hoenheimsports.backend.membershipservice.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record MembershipPaymentOrder(
        @NotNull(message = "La campagne est obligatoire")
        UUID campaignId,
        @Valid
        PaymentPayerInfoCreateRequest paymentPayerInfoCreateRequest,
        @Valid
        List<MembershipCreateRequest> membershipCreateRequests) {

}
