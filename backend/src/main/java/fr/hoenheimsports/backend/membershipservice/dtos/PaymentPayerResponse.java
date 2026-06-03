package fr.hoenheimsports.backend.membershipservice.dtos;

/**
 * DTO representing payment payer details.
 */
public record PaymentPayerResponse(
        String firstName,
        String lastName,
        String email
) {
}
