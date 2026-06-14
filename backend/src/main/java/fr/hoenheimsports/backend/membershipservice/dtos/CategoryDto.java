package fr.hoenheimsports.backend.membershipservice.dtos;

import jakarta.validation.constraints.*;
import org.jspecify.annotations.NullMarked;

import java.math.BigDecimal;

/**
 * DTO for creating or representing a category within a campaign.
 *
 * @param name   the category name (e.g. "U13", "Seniors")
 * @param amount the price amount of the category
 */
@NullMarked
public record CategoryDto(
    @NotBlank(message = "Le nom de la catégorie est obligatoire")
    @Size(max = 20, message = "Le nom de la catégorie ne doit pas dépasser 20 caractères")
    String name,

    @NotNull(message = "Le montant est obligatoire")
    @Positive(message = "Le montant doit être positif")
    @Digits(integer = 17, fraction = 2, message = "Le montant doit être un nombre décimal à 2 chiffres après la virgule")
    BigDecimal amount
) {
}
