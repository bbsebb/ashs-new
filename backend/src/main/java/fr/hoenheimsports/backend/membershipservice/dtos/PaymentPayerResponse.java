package fr.hoenheimsports.backend.membershipservice.dtos;

/**
 * DTO representing payment payer details.
 *
 * @param firstName the payer's first name
 * @param lastName  the payer's last name
 * @param email     the payer's email address
 */
public record PaymentPayerResponse(
        String firstName,
        String lastName,
        String email
) {
}
