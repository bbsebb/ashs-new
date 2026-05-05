package fr.hoenheimsports.backend.membershipservice.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * DTO for creating a membership.
 */
public record MembershipCreateRequest(
    @NotNull(message = "Campaign ID is required")
    UUID campaignId,
    @NotBlank(message = "First name is required")
    String firstName,
    @NotBlank(message = "Last name is required")
    String lastName,
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    String email,
    @NotBlank(message = "License number is required")
    String licenseNumber,
    @NotBlank(message = "Category name is required")
    String categoryName
) {
}
