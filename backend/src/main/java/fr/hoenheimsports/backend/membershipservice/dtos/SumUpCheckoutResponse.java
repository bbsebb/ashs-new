package fr.hoenheimsports.backend.membershipservice.dtos;

/**
 * DTO for the SumUp checkout response.
 */
public record SumUpCheckoutResponse(
    String id,
    String status,
    String checkout_url
) {
}
