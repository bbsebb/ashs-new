package fr.hoenheimsports.backend.membershipservice.dtos;

import fr.hoenheimsports.backend.membershipservice.entities.CampaignStatus;
import org.jspecify.annotations.NullMarked;

import java.util.Set;
import java.util.UUID;

/**
 * Response DTO representing a membership campaign.
 */
@NullMarked
public record CampaignResponse(
    UUID id,
    UUID seasonId,
    CampaignStatus status,
    Set<CategoryDto> categories
) {
}
