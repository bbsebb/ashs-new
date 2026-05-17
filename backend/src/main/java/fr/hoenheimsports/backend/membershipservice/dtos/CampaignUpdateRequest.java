package fr.hoenheimsports.backend.membershipservice.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import org.jspecify.annotations.NullMarked;

import java.util.Set;

/**
 * Request DTO for updating an existing membership campaign.
 */
@NullMarked
public record CampaignUpdateRequest(
        @NotEmpty(message = "La campagne doit contenir au moins une catégorie")
        @Valid
        Set<CategoryDto> categories
) {
}
