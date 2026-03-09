package fr.hoenheimsports.backend.staffservice.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record StaffCreateRequest(
        @NotBlank(message = "Le prénom est obligatoire")
        String firstName,

        @NotBlank(message = "Le nom est obligatoire")
        String lastName,

        @Email(message = "L'adresse e-mail est invalide")
        String email,

        @Pattern(
                regexp = "^[0-9+()\\-\\s]{6,20}$",
                message = "Le numéro de téléphone est invalide"
        )
        String phone) {
}
