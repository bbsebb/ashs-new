package fr.hoenheimsports.backend.staffservice.entities;

import jakarta.persistence.Embeddable;
import org.jspecify.annotations.Nullable;

@Embeddable

public record Email(@jakarta.validation.constraints.Email @Nullable String email) {
}
