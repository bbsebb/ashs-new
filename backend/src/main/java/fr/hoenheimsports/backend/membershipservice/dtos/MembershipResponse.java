package fr.hoenheimsports.backend.membershipservice.dtos;

import fr.hoenheimsports.backend.membershipservice.entities.MembershipStatus;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for membership response.
 *
 * @param id            the unique membership ID
 * @param campaignId    the campaign ID
 * @param firstName     the member's first name
 * @param lastName      the member's last name
 * @param email         the member's email address
 * @param licenseNumber the member's license number
 * @param categoryName  the name of the category
 * @param amount        the price paid
 * @param status        the current membership status
 */
public record MembershipResponse(
    UUID id,
    UUID campaignId,
    String firstName,
    String lastName,
    String email,
    String licenseNumber,
    String categoryName,
    BigDecimal amount,
    MembershipStatus status
) {
}
