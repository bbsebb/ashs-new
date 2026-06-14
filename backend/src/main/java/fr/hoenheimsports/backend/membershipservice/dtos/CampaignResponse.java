package fr.hoenheimsports.backend.membershipservice.dtos;

import fr.hoenheimsports.backend.membershipservice.entities.CampaignStatus;
import org.jspecify.annotations.NullMarked;

import java.util.Set;
import java.util.UUID;

/**
 * Response DTO representing a membership campaign.
 *
 * @param id         the unique identifier of the campaign
 * @param seasonId   the UUID of the associated season
 * @param status     the current status of the campaign
 * @param categories the categories configured for the campaign
 */
@NullMarked
public record CampaignResponse(
    UUID id,
    UUID seasonId,
    CampaignStatus status,
    Set<CategoryDto> categories
) {
}
