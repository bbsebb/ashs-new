package fr.hoenheimsports.backend.membershipservice.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.jspecify.annotations.NullMarked;

import java.util.Set;
import java.util.UUID;

/**
 * Request DTO for creating a new membership campaign.
 *
 * @param seasonId   the UUID of the season this campaign belongs to
 * @param categories the set of membership categories available in this campaign
 */
@NullMarked
public record CampaignCreateRequest(
    @NotNull(message = "L'identifiant de la saison est obligatoire")
    UUID seasonId,

    @NotEmpty(message = "La campagne doit contenir au moins une catégorie")
    @Valid
    Set<CategoryDto> categories
) {
}
