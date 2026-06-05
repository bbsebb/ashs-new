package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.dtos.*;
import fr.hoenheimsports.backend.membershipservice.entities.Membership;
import fr.hoenheimsports.backend.membershipservice.entities.PaymentTransaction;
import fr.hoenheimsports.backend.membershipservice.entities.SumUpCheckout;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Mapper component for mapping Membership and PaymentTransaction entities to their respective DTOs.
 */
@Component
public class MembershipMapper {

    /**
     * Maps a Membership entity to a MembershipResponse DTO.
     *
     * @param membership the membership entity to map
     * @return the mapped MembershipResponse DTO
     */
    public MembershipResponse mapToResponse(Membership membership) {
        return new MembershipResponse(
                membership.getId(),
                membership.getCampaignId(),
                membership.getFirstName(),
                membership.getLastName(),
                membership.getEmail().value(),
                membership.getLicenseNumber().value(),
                membership.getCategory().getName(),
                membership.getCategory().getPrice().amount(),
                membership.getStatus()
        );
    }

    /**
     * Maps a PaymentTransaction entity to a MembershipPaymentResponse DTO.
     *
     * @param paymentTransaction the payment transaction to map
     * @return the mapped MembershipPaymentResponse DTO
     */
    public MembershipPaymentResponse mapToResponse(PaymentTransaction paymentTransaction) {
        SumUpCheckout checkout = paymentTransaction.getSumupCheckout();
        SumUpCheckoutDto checkoutDto = new SumUpCheckoutDto(
                checkout.id(),
                checkout.description(),
                checkout.returnUrl(),
                checkout.date(),
                checkout.checkoutUrl()
        );
        return new MembershipPaymentResponse(
                paymentTransaction.getId(),
                checkoutDto,
                paymentTransaction.getMemberships().stream()
                        .map(this::mapToResponse)
                        .toList()
        );
    }

    /**
     * Maps a PaymentTransaction entity to a PaymentResponse DTO.
     *
     * @param paymentTransaction the payment transaction to map
     * @return the mapped PaymentResponse DTO
     */
    public PaymentResponse mapToPaymentResponse(PaymentTransaction paymentTransaction) {
        PaymentPayerResponse payerResponse = new PaymentPayerResponse(
                paymentTransaction.getPayerInfo().firstName(),
                paymentTransaction.getPayerInfo().lastName(),
                paymentTransaction.getPayerInfo().email()
        );
        String checkoutDate = paymentTransaction.getSumupCheckout().date();
        List<MembershipResponse> memberships = paymentTransaction.getMemberships().stream()
                .map(this::mapToResponse)
                .toList();

        return new PaymentResponse(
                paymentTransaction.getId(),
                paymentTransaction.getCampaignId(),
                paymentTransaction.getAmount().amount(),
                payerResponse,
                paymentTransaction.getStatus(),
                checkoutDate,
                paymentTransaction.isDiscounted(),
                memberships
        );
    }
}
