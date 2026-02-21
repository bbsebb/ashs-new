package fr.hoenheimsports.backend.contactservice.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

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
