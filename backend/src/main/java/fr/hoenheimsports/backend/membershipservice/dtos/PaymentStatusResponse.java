package fr.hoenheimsports.backend.membershipservice.dtos;

import fr.hoenheimsports.backend.membershipservice.entities.MembershipStatus;

/**
 * DTO representing only the status of a payment transaction.
 * Intended for public exposure.
 *
 * @param status the payment/membership status
 */
public record PaymentStatusResponse(
        MembershipStatus status
) {
}
