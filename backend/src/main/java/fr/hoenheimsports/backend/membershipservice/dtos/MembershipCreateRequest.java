package fr.hoenheimsports.backend.membershipservice.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for creating a membership.
 */
public record MembershipCreateRequest(
        @NotBlank(message = "Le prénom est requis")
    String firstName,
        @NotBlank(message = "Le nom est requis")
    String lastName,
        @NotBlank(message = "L’e-mail est requis")
        @Email(message = "L’e-mail doit être valide")
    String email,
        @NotBlank(message = "Le numéro de licence est requis")
    String licenseNumber,
        @NotNull(message = "Le nom de la catégorie est requis")
        @Valid
        CategoryDto category
) {
}
