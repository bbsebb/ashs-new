package fr.hoenheimsports.backend.contactservice.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object representing a contact request submitted by a user.
 *
 * @param from    the sender's email address
 * @param subject the subject of the contact message
 * @param content the content of the contact message
 */
public record ContactRequest(
        @Email(message = "L'adresse e-mail est invalide")
        @NotBlank(message = "L'adresse e-mail est obligatoire")
        String from,
        @NotBlank(message = "Le sujet est obligatoire")
        @Size(min = 5, max = 100, message = "Le sujet doit contenir entre 5 et 100 caractères")
        String subject,
        @NotBlank(message = "Le message est obligatoire")
        @Size(min = 10, max = 2000, message = "Le message doit contenir entre 10 et 2000 caractères")
        String content) {
}
