package fr.hoenheimsports.backend.membershipservice.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PaymentPayerInfoCreateRequest(
        @NotBlank(message = "Le prénom est obligatoire")
        String firstname,
        @NotBlank(message = "Le nom est obligatoire")
        String lastname,
        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "L'email doit être valide")
        String email
) {
}
