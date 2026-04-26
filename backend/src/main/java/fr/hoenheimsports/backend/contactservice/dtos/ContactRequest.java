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
        @Email
        @NotBlank
        String from,
        @NotBlank
        @Size(min = 5, max = 100)
        String subject,
        @NotBlank
        @Size(min = 10, max = 2000)
        String content) {
}
