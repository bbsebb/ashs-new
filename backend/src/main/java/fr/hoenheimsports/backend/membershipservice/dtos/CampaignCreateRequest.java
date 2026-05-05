package fr.hoenheimsports.backend.membershipservice.dtos;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.jspecify.annotations.NullMarked;

import java.util.Set;
import java.util.UUID;

/**
 * Request DTO for creating a new membership campaign.
 */
@NullMarked
public record CampaignCreateRequest(
    @NotNull(message = "L'identifiant de la saison est obligatoire")
    UUID seasonId,

    @NotEmpty(message = "La campagne doit contenir au moins une catégorie")
    Set<CategoryDto> categories
) {
}
