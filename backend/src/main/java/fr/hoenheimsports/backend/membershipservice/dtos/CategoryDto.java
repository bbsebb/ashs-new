package fr.hoenheimsports.backend.membershipservice.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.jspecify.annotations.NullMarked;

import java.math.BigDecimal;

/**
 * DTO for creating or representing a category within a campaign.
 */
@NullMarked
public record CategoryDto(
    @NotBlank(message = "Le nom de la catégorie est obligatoire")
    String name,

    @NotNull(message = "Le montant est obligatoire")
    @Positive(message = "Le montant doit être positif")
    BigDecimal amount
) {
}
