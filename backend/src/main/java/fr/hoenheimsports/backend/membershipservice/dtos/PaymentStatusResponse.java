package fr.hoenheimsports.backend.membershipservice.dtos;

import fr.hoenheimsports.backend.membershipservice.entities.MembershipStatus;

/**
 * DTO representing only the status of a payment transaction.
 * Intended for public exposure.
 */
public record PaymentStatusResponse(
        MembershipStatus status
) {
}
