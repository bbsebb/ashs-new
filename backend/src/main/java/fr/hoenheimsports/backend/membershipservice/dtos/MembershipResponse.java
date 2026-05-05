package fr.hoenheimsports.backend.membershipservice.dtos;

import fr.hoenheimsports.backend.membershipservice.entities.MembershipStatus;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for membership response.
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
